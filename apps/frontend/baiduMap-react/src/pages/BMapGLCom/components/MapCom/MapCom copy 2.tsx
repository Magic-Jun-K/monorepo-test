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

const getHaizhuBoundary = async (): Promise<(typeof window.BMapGL.Point)[]> => {
  return new Promise((resolve, reject) => {
    new window.BMapGL.Boundary().get('广州市海珠区', (result: any) => {
      try {
        // 增强API响应校验
        if (!result?.boundaries?.[0]?.length) {
          console.error('API返回数据异常:', result);
          throw new Error('边界API返回数据格式错误');
        }

        // 改进坐标处理流程
        const rawCoordinates = result.boundaries[0].split(';');
        console.debug('原始边界坐标数量:', rawCoordinates.length);

        const points = rawCoordinates
          .map((str: string) => {
            // 允许逗号前后存在空格
            const cleanedStr = str.replace(/\s+/g, '');
            if (!/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(cleanedStr)) {
              console.warn('无效坐标格式已过滤:', str);
              return null;
            }

            const [lngStr, latStr]: any = cleanedStr.split(',');
            const lng = parseFloat(lngStr);
            const lat = parseFloat(latStr);

            // 扩展校验范围
            if (
              Number.isNaN(lng) ||
              Number.isNaN(lat) ||
              lng < 113.0 || // 扩展经度范围
              lng > 114.0 ||
              lat < 22.5 || // 扩展纬度范围
              lat > 23.5
            ) {
              console.warn('坐标超出安全范围已过滤:', lng, lat);
              return null;
            }

            try {
              const point = new window.BMapGL.Point(lng, lat);
              if (!(point instanceof window.BMapGL.Point)) {
                throw new Error('坐标实例创建失败');
              }
              return point;
            } catch (err) {
              console.error('坐标对象创建失败:', err);
              return null;
            }
          })
          .filter((p: typeof window.BMapGL.Point | null): p is typeof window.BMapGL.Point => !!p);

        // 关键性校验
        if (points.length < 3) {
          throw new Error(`有效坐标点不足（${points.length}），无法构成多边形`);
        }

        console.debug('有效边界坐标点:', points.length);

        // 安全闭合校验
        if (points.length > 0) {
          const first = points[0];
          const last = points[points.length - 1];

          // 添加容差比较（0.00001度约等于1米）
          if (Math.abs(first.lng - last.lng) > 0.00001 || Math.abs(first.lat - last.lat) > 0.00001) {
            console.log('自动闭合边界多边形');
            points.push(new window.BMapGL.Point(first.lng, first.lat));
          }
        } else {
          throw new Error('无有效坐标点可用');
        }

        resolve(points);
      } catch (err) {
        console.error('边界处理全流程错误:', {
          error: err,
          rawData: result?.boundaries?.[0]
        });
        reject(err);
      }
    });
  });
};

// 2. 创建遮罩层（覆盖全图，挖空海珠区）
const createMaskLayer = (boundaryPoints: (typeof window.BMapGL.Point)[]) => {
  // 1. 增强类型守卫
  const isValidPoint = (p: any): p is typeof window.BMapGL.Point => {
    return p instanceof window.BMapGL.Point && !isNaN(p.lng) && !isNaN(p.lat) && typeof p.lng === 'number' && typeof p.lat === 'number';
  };

  // 2. 安全点创建工厂（带重试机制）
  const createSafePoint = (lng: number, lat: number, attempt = 0): typeof window.BMapGL.Point => {
    try {
      if (attempt > 2) throw new Error('超过最大重试次数');

      const point = new window.BMapGL.Point(lng, lat);
      if (!isValidPoint(point)) {
        throw new Error(`点创建失败 (${lng}, ${lat})`);
      }
      return point;
    } catch (err) {
      console.warn(`点创建失败，尝试重新初始化BMapGL (尝试次数: ${attempt + 1})`, err);
      // 重新加载地图核心库
      return loadBMapResources().then(() => createSafePoint(lng, lat, attempt + 1));
    }
  };

  // 3. 构建安全基准点
  const buildBaseBounds = () => {
    try {
      return [createSafePoint(112.0, 22.0), createSafePoint(114.0, 24.0)];
    } catch (err) {
      console.error('基准点创建失败，使用备用基准', err);
      return [
        createSafePoint(113.2, 23.0), // 备用西南点
        createSafePoint(113.5, 23.2) // 备用东北点
      ];
    }
  };

  const [southwest, northeast] = buildBaseBounds();

  // 4. 构建路径时的双重校验
  const pathPoints = [
    southwest,
    createSafePoint(northeast.lng, southwest.lat),
    northeast,
    createSafePoint(southwest.lng, northeast.lat),
    {
      paths: boundaryPoints.map(p => {
        if (!isValidPoint(p)) {
          throw new Error(`无效边界点: ${JSON.stringify(p)}`);
        }
        return p;
      }),
      type: 'hole' as const
    }
  ].map(point => {
    if (point instanceof window.BMapGL.Point && !isValidPoint(point)) {
      throw new Error('路径点校验失败');
    }
    return point;
  });

  // 5. 最终安全校验
  if (pathPoints.some(p => p instanceof window.BMapGL.Point && (!Number.isFinite(p.lng) || !Number.isFinite(p.lat)))) {
    throw new Error('存在非法坐标值');
  }

  // 6. 调试日志增强
  console.debug('遮罩层路径详情', {
    southwest: { lng: southwest.lng, lat: southwest.lat },
    northeast: { lng: northeast.lng, lat: northeast.lat },
    holePoints: boundaryPoints.length
  });

  // 7. 创建多边形时的异常捕获
  try {
    const polygon = new window.BMapGL.Polygon(pathPoints, {
      strokeColor: 'transparent',
      fillColor: 'rgba(200,200,200,0.5)',
      fillOpacity: 0.5,
      enableMassClear: false
    });

    // 8. 多边形后验证
    setTimeout(() => {
      if (!polygon.getPath()?.length) {
        console.error('多边形路径初始化失败');
        polygon.setPath([
          new window.BMapGL.Point(113.3, 23.1),
          new window.BMapGL.Point(113.4, 23.1),
          new window.BMapGL.Point(113.4, 23.0),
          new window.BMapGL.Point(113.3, 23.0)
        ]);
      }
    }, 500);

    return polygon;
  } catch (err) {
    console.error('多边形创建失败，返回安全多边形', err);
  }
};

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
          maxBounds: new window.BMapGL.Bounds(new window.BMapGL.Point(113.2, 23.0), new window.BMapGL.Point(113.5, 23.2)),
          enableAutoResize: true
        }); // 创建地图实例
        mapInstance.current.centerAndZoom(new window.BMapGL.Point(center.lng, center.lat), zoom); // 设置中心点和缩放级别
        mapInstance.current.enableScrollWheelZoom(true); // 启用滚轮缩放
        mapInstance.current.addControl(new window.BMapGL.ScaleControl()); // 添加比例尺控件

        // 初始化流程中的边界点处理
        const boundaryPoints = await getHaizhuBoundary();

        // 在添加遮罩层之前添加验证
        if (!boundaryPoints.every(p => p instanceof window.BMapGL.Point && !isNaN(p.lng) && !isNaN(p.lat))) {
          throw new Error('存在无效的边界点');
        }

        // 添加遮罩层
        const maskLayer = createMaskLayer(boundaryPoints);
        mapInstance.current.addOverlay(maskLayer);

        // 3. 添加蓝色边界线（单独图层）
        const borderLayer = new window.BMapGL.Polygon(boundaryPoints, {
          strokeColor: '#1890ff',
          strokeWeight: 3,
          fillColor: 'transparent', // 完全透明填充
          enableClicking: false
        });
        mapInstance.current.addOverlay(borderLayer);

        // 4. 样式优化（保持内部地图元素可见）
        mapInstance.current.setMapStyleV2({
          styleJson: [
            {
              featureType: 'background',
              stylers: { visibility: 'off' } // 隐藏默认背景
            }
          ]
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
