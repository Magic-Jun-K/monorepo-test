import { FC, useEffect, useRef } from 'react';
import { loadScript, loadCSS } from '@/utils/index';
import { BASE_URL } from '@/config';

interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
}

declare global {
  interface Window {
    BMapGL: any;
    BMapGLLib: any;
    onBMapCallback: any;
    mapv: any;
    mapvgl: any;
  }
}

// 配置常量
const MAP_CONFIG = {
  AK: 'VyYLcISnIl9Pkivq8WD8TmNMjzkP76mZ',
  ICON_CLUSTER: `${BASE_URL}/images/iconCluster.png`,
  ICON_IMAGE: `${BASE_URL}/images/image.png`,
  DATA_BOUNDS: [113.25167, 113.42317, 23.10791, 23.09372] as [number, number, number, number],
  POINT_COUNT: 500000
};

const getHaizhuBoundary = () => {
  return new Promise<(typeof window.BMapGL.Point)[]>(resolve => {
    new window.BMapGL.Boundary().get('广州市海珠区', (result: any) => {
      const points = result.boundaries[0].split(';').map((str: string) => {
        const [lng, lat] = str.split(',').map(Number);
        return new window.BMapGL.Point(lng, lat);
      });
      resolve(points);
    });
  });
};

// 自定义地图样式（隐藏非海珠区区域）
// const mapStyle = {
//   styleJson: [
//     {
//       featureType: 'land', // 陆地
//       elementType: 'geometry',
//       stylers: {
//         color: '#00000000', // 完全透明
//         visibility: 'off'
//       }
//     },
//     {
//       featureType: 'water', // 水域
//       elementType: 'geometry',
//       stylers: {
//         color: '#00000000',
//         visibility: 'off'
//       }
//     },
//     {
//       featureType: 'building', // 建筑物
//       elementType: 'geometry',
//       stylers: {
//         visibility: 'on',
//         color: '#f0f0f0' // 浅灰色建筑
//       }
//     }
//   ]
// };

const loadBMapResources = async () => {
  // 使用 Promise 包装地图核心加载
  await new Promise<void>((resolve, reject) => {
    window.onBMapCallback = () => {
      if (window.BMapGL) {
        console.log('BMapGL 初始化完成');
        resolve();
      } else {
        reject(new Error('BMapGL 未定义'));
      }
    };

    loadScript(`//api.map.baidu.com/api?v=3.0&type=webgl&ak=${MAP_CONFIG.AK}&callback=onBMapCallback`).catch(reject);
  });

  /* BMapLib */
  // loadCSS('https://huiyan-fe.github.io/BMap-JavaScript-library/src/DrawingManager/DrawingManager.min.css');
  // loadScript('https://huiyan-fe.github.io/BMap-JavaScript-library/src/DrawingManager/DrawingManager.min.js');

  /* BMapGLLib */
  // 并行加载扩展库
  await Promise.all([
    loadCSS('https://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.css'),
    loadScript('https://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js')
  ]);
};

const MapCom: FC<MapProps> = ({ mapParams }) => {
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  //   const BMapGLRef = useRef<typeof window.BMapGL | null>(null);
  const mapInstance = useRef<typeof window.BMapGL | null>(null);
  // const BMapGLLibRef = useRef<typeof window.BMapGLLib | null>(null);
  const viewInstance = useRef<InstanceType<(typeof window.mapvgl)['View']> | null>(null);
  const iconClusterLayerInstance = useRef<InstanceType<(typeof window.mapvgl)['IconClusterLayer']> | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // 初始化 Web Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./map.worker.ts', import.meta.url));

    workerRef.current.onmessage = e => {
      if (e.data.type === 'pointsComplete') {
        // 一次性设置全部数据
        iconClusterLayerInstance.current?.setData(
          e.data.points.map((p: any) => ({
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
        await loadBMapResources();
        if (!mapRef.current) return;

        // 初始化地图实例
        mapInstance.current = new window.BMapGL.Map(mapRef.current, {
          restrictCenter: false, // 允许调整中心点
          enableAutoResize: true
        }); // 创建地图实例
        mapInstance.current.centerAndZoom(new window.BMapGL.Point(center.lng, center.lat), zoom); // 设置中心点和缩放级别
        mapInstance.current.enableScrollWheelZoom(true); // 启用滚轮缩放
        mapInstance.current.addControl(new window.BMapGL.ScaleControl()); // 添加比例尺控件

        // 获取海珠区边界
        const boundaryPoints = await getHaizhuBoundary();

        // 创建边界对象
        const bounds = new window.BMapGL.Bounds(
          boundaryPoints.reduce(
            (sw, point) => new window.BMapGL.Point(Math.min(sw.lng, point.lng), Math.min(sw.lat, point.lat)),
            new window.BMapGL.Point(Infinity, Infinity)
          ),
          boundaryPoints.reduce(
            (ne, point) => new window.BMapGL.Point(Math.max(ne.lng, point.lng), Math.max(ne.lat, point.lat)),
            new window.BMapGL.Point(-Infinity, -Infinity)
          )
        );

        // 设置地图显示范围
        mapInstance.current.setViewport(boundaryPoints);

        // 添加边界覆盖物
        const polygon = new window.BMapGL.Polygon(boundaryPoints, {
          strokeColor: '#1890ff',
          strokeWeight: 3,
          fillColor: '#1890ff20',
          enableClicking: false
        });
        mapInstance.current.addOverlay(polygon);

        // 限制地图拖动范围
        mapInstance.current.addEventListener('movend', () => {
          const currentBounds = mapInstance.current.getBounds();
          if (!bounds.contains(currentBounds.getSouthWest()) || !bounds.contains(currentBounds.getNorthEast())) {
            mapInstance.current.setViewport(boundaryPoints);
          }
        });

        // 初始化 MapVGL
        await loadScript('https://unpkg.com/mapvgl@1.0.0-beta.191/dist/mapvgl.min.js');
        viewInstance.current = new window.mapvgl.View({ map: mapInstance.current });

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
          onClick: (e: any) => {
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

      return () => {
        iconClusterLayerInstance.current?.destroy();
        viewInstance.current?.destroy();
        mapInstance.current?.destroy();
      };
    };
    initMap();
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};
export default MapCom;
