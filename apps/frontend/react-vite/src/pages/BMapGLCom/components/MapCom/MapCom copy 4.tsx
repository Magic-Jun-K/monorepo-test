import { FC, useEffect, useRef } from 'react';
import { loadScript, loadCSS } from '@/utils/index';
import { BASE_URL } from '@/config';

interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
}

interface WorkerPoint {
  lng: number;
  lat: number;
}

interface ClusterClickEvent {
  dataItem?: {
    geometry: {
      coordinates: [number, number];
    };
  };
}

// 配置常量
const MAP_CONFIG = {
  AK: 'VyYLcISnIl9Pkivq8WD8TmNMjzkP76mZ',
  ICON_CLUSTER: `${BASE_URL}/images/iconCluster.png`,
  ICON_IMAGE: `${BASE_URL}/images/image.png`,
  DATA_BOUNDS: [113.25167, 113.42317, 23.10791, 23.09372] as [number, number, number, number], // 数据边界
  POINT_COUNT: 1000000, // 落点数量
};

let scriptPromise: Promise<typeof window.BMapGL> | null = null;
const loadBMapScript = () => {
  console.log('测试scriptPromise', scriptPromise);

  if (scriptPromise) {
    console.log('BMapGL 已加载，返回已加载的');
    return scriptPromise;
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      // 百度地图异步加载回调处理
      window.onBMapCallback = function () {
        if (window.BMapGL) {
          console.log('BMapGL 初始化完成', window.BMapGL);
          resolve(window.BMapGL);
        } else {
          reject(new Error('BMapGL 未定义'));
        }
      };

      loadScript(`//api.map.baidu.com/api?v=3.0&type=webgl&ak=${MAP_CONFIG.AK}&callback=onBMapCallback`).catch(reject);
      /* BMapLib */
      // loadCSS('https://huiyan-fe.github.io/BMap-JavaScript-library/src/DrawingManager/DrawingManager.min.css');
      // loadScript('https://huiyan-fe.github.io/BMap-JavaScript-library/src/DrawingManager/DrawingManager.min.js');
      /* BMapGLLib */
      setTimeout(() => {
        loadCSS('https://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.css');
        loadScript('https://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js');
      }, 2500);
    });
  }
  return scriptPromise;
};

const MapCom: FC<MapProps> = ({ mapParams }) => {
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<typeof window.BMapGL | null>(null);
  const viewInstance = useRef<InstanceType<(typeof window.mapvgl)['View']> | null>(null);
  const iconClusterLayerInstance = useRef<InstanceType<(typeof window.mapvgl)['IconClusterLayer']> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // 初始化 Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./map.worker.ts', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = e => {
      if (e.data.type === 'pointsComplete') {
        // 一次性设置全部数据
        iconClusterLayerInstance.current?.setData(
          e.data.points.map((p: WorkerPoint) => ({
            geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            properties: { icon: MAP_CONFIG.ICON_IMAGE, width: 100 / 6, height: 153 / 6 }
          }))
        );
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      try {
        // 加载百度地图资源
        // await loadBMapResources();
        await loadBMapScript();

        // Ensure container is properly initialized
        if (!mapRef.current || !mapRef.current.clientWidth || !mapRef.current.clientHeight) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!mapRef.current) return;
        }

        // 初始化地图实例
        mapInstance.current = new window.BMapGL.Map(mapRef.current, {
          maxBounds: new window.BMapGL.Bounds(new window.BMapGL.Point(113.2, 23.0), new window.BMapGL.Point(113.5, 23.2)),
          enableAutoResize: true
        }); // 创建地图实例
        mapInstance.current.centerAndZoom(new window.BMapGL.Point(center.lng, center.lat), zoom); // 设置中心点和缩放级别
        mapInstance.current.enableScrollWheelZoom(true); // 启用滚轮缩放
        mapInstance.current.addControl(new window.BMapGL.ScaleControl()); // 添加比例尺控件

        // 初始化 MapVGL
        await loadScript('https://unpkg.com/mapvgl@1.0.0-beta.191/dist/mapvgl.min.js');
        viewInstance.current = new window.mapvgl.View({ map: mapInstance.current });

        console.log("测试1111", window.mapvgl);
        // 创建图层
        iconClusterLayerInstance.current = new window.mapvgl.IconClusterLayer({
          minSize: 25,
          maxSize: 40,
          clusterRadius: 200,
          textOptions: {
            fontSize: 12,
            color: '#fff',
            format: (count: number) => (count >= 1e4 ? `${(count / 1e3).toFixed(0)}k` : count.toString())
          },
          iconOptions: { width: 100, height: 100 },
          iconExtent: { 0: MAP_CONFIG.ICON_CLUSTER },
          enablePicked: true,
          onClick: (e: ClusterClickEvent) => {
            if (e.dataItem) {
              // 可通过dataItem下面的children属性拿到被聚合的所有点
              console.log('测试iconClusterLayer click', e.dataItem);
              const [lng, lat] = e.dataItem.geometry.coordinates;
              mapInstance.current.panTo(new window.BMapGL.Point(lng, lat));
              mapInstance.current?.setZoom(mapInstance.current.getZoom() + 2);
            }
          }
        });
        viewInstance.current.addLayer(iconClusterLayerInstance.current);

        // 启动数据生成
        workerRef.current?.postMessage({
          type: 'generatePoints',
          count: MAP_CONFIG.POINT_COUNT,
          bounds: MAP_CONFIG.DATA_BOUNDS
        });
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };

    initMap();

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;

      mapInstance.current?.clearOverlays();
      mapInstance.current = null;

      viewInstance.current = null;
      iconClusterLayerInstance.current = null;
    };
  }, [center, zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
};
export default MapCom;
