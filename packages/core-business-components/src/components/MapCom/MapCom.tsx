import { FC, useEffect, useRef } from 'react';

import { loadScript } from '@/utils/loadScript';
import { loadBMapScript, loadBMapGLLib } from './utils/bmap';
import { MapProps, WorkerPoint, ClusterClickEvent } from './types';
import mapWorkerCode from './worker/map.worker.js?raw';

// 配置常量
const MAP_CONFIG = {
  DATA_BOUNDS: [113.25167, 113.42317, 23.10791, 23.09372] as [number, number, number, number], // 数据边界
  POINT_COUNT: 1000000 // 保持100万落点数据
};

// 导出MapInstance类型
export type MapInstance = InstanceType<typeof window.BMapGL.Map>;

export const MapCom: FC<MapProps> = ({ mapParams, iconClusterUrl, iconImageUrl }) => {
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapInstance | null>(null);
  const viewInstance = useRef<InstanceType<(typeof window.mapvgl)['View']> | null>(null);
  const iconClusterLayerInstance = useRef<InstanceType<
    (typeof window.mapvgl)['IconClusterLayer']
  > | null>(null);
  const workerRef = useRef<Worker | null>(null);
  // 在组件中添加状态跟踪已加载的数据
  const allMapData = useRef<any[]>([]);
  // 添加状态跟踪渲染定时器
  const renderTimer = useRef<NodeJS.Timeout | null>(null);

  // 初始化 Web Worker
  useEffect(() => {
    try {
      // 使用更简单的Worker创建方式
      const blob = new Blob([mapWorkerCode], { type: 'application/javascript' });
      workerRef.current = new Worker(URL.createObjectURL(blob));

      // 传递 wasm 路径给 worker
      // 使用完整的URL路径
      const wasmUrl = new URL('/wasm/release.wasm', window.location.origin).toString();
      workerRef.current.postMessage({ type: 'initWasm', wasmUrl });

      // 修改Worker消息处理
      workerRef.current.onmessage = e => {
        if (e.data.type === 'pointsComplete') {
          // 原有的处理逻辑
          iconClusterLayerInstance.current?.setData(
            e.data.points.map((p: WorkerPoint) => ({
              geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
              properties: { icon: iconImageUrl, width: 100 / 6, height: 153 / 6 }
            }))
          );
        } else if (e.data.type === 'pointsBatch') {
          // 处理批次数据
          const { buffer, count, isLastBatch } = e.data;
          const pointsArray = new Float64Array(buffer);

          // 构建当前批次的地图数据
          const batchData = [];
          for (let i = 0; i < count; i++) {
            const lng = pointsArray[i * 2];
            const lat = pointsArray[i * 2 + 1];
            batchData.push({
              geometry: { type: 'Point', coordinates: [lng, lat] },
              properties: { icon: iconImageUrl, width: 100 / 6, height: 153 / 6 }
            });
          }

          // 添加到总数据集
          allMapData.current = [...allMapData.current, ...batchData];

          // 优化渲染策略：使用防抖机制，避免频繁渲染
          if (renderTimer.current) {
            clearTimeout(renderTimer.current);
          }

          // 对于前几个批次，立即渲染以提供快速反馈
          if (allMapData.current.length <= 150000) {
            const renderStart = performance.now();
            iconClusterLayerInstance.current?.setData(allMapData.current);
            const renderEnd = performance.now();
            console.log(
              `快速渲染 ${allMapData.current.length} 个点位，耗时: ${renderEnd - renderStart}ms`
            );
          } else {
            // 对于后续批次，使用防抖机制
            renderTimer.current = setTimeout(() => {
              const renderStart = performance.now();
              iconClusterLayerInstance.current?.setData(allMapData.current);
              const renderEnd = performance.now();
              console.log(
                `防抖渲染 ${allMapData.current.length} 个点位，耗时: ${renderEnd - renderStart}ms`
              );
            }, 20); // 减少防抖延迟到20ms
          }

          // 如果是最后一批，确保立即渲染
          if (isLastBatch) {
            if (renderTimer.current) {
              clearTimeout(renderTimer.current);
              renderTimer.current = null;
            }
            const renderStart = performance.now();
            iconClusterLayerInstance.current?.setData(allMapData.current);
            const renderEnd = performance.now();
            console.log(
              `最终渲染 ${allMapData.current.length} 个点位，耗时: ${renderEnd - renderStart}ms`
            );
          }
        }
      };
    } catch (error) {
      console.error('Worker初始化失败:', error);
      // 降级处理：不使用Worker，直接在主线程生成数据
      generateDataInMainThread();
    }

    return () => {
      if (renderTimer.current) {
        clearTimeout(renderTimer.current);
      }
      workerRef.current?.terminate();
    };
  }, []);

  // 添加主线程数据生成函数作为降级方案
  const generateDataInMainThread = () => {
    const points = [];
    const {
      count,
      bounds: [minLng, maxLng, minLat, maxLat]
    } = {
      count: MAP_CONFIG.POINT_COUNT,
      bounds: MAP_CONFIG.DATA_BOUNDS
    };

    for (let i = 0; i < count; i++) {
      points.push({
        lng: minLng + Math.random() * (maxLng - minLng),
        lat: minLat + Math.random() * (maxLat - minLat)
      });
    }

    iconClusterLayerInstance.current?.setData(
      points.map(p => ({
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: { icon: iconImageUrl, width: 100 / 6, height: 153 / 6 }
      }))
    );
  };

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      try {
        // 加载百度地图资源
        await loadBMapScript();
        requestIdleCallback(() =>
          loadBMapGLLib()
            .then(() => {
              console.log('BMapGLLib 加载完成');
            })
            .catch(error => {
              console.error('BMapGLLib 加载失败:', error);
            })
        );

        // Ensure container is properly initialized
        if (!mapRef.current || !mapRef.current.clientWidth || !mapRef.current.clientHeight) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!mapRef.current) return;
        }

        // 初始化地图实例
        mapInstance.current = new window.BMapGL.Map(mapRef.current, {
          maxBounds: new window.BMapGL.Bounds(
            new window.BMapGL.Point(113.2, 23.0),
            new window.BMapGL.Point(113.5, 23.2)
          ),
          enableAutoResize: true
        }); // 创建地图实例
        mapInstance.current.centerAndZoom(new window.BMapGL.Point(center.lng, center.lat), zoom); // 设置中心点和缩放级别
        mapInstance.current.enableScrollWheelZoom(true); // 启用滚轮缩放
        mapInstance.current.addControl(new window.BMapGL.ScaleControl()); // 添加比例尺控件

        // 初始化 MapVGL，添加错误处理
        try {
          // await loadScript('https://unpkg.com/mapvgl/dist/mapvgl.min.js');
          await loadScript('https://unpkg.com/mapvgl@1.0.0-beta.194/dist/mapvgl.min.js');
          if (window.mapvgl && mapInstance.current) {
            viewInstance.current = new window.mapvgl.View({ map: mapInstance.current });

            console.log('测试mapvgl', window.mapvgl);
            // 创建图层
            iconClusterLayerInstance.current = new window.mapvgl.IconClusterLayer({
              minSize: 25,
              maxSize: 40,
              clusterRadius: 200,
              textOptions: {
                fontSize: 12,
                color: '#fff',
                format: (count: number) =>
                  count >= 1e4 ? `${(count / 1e3).toFixed(0)}k` : count.toString()
              },
              iconOptions: { width: 100, height: 100 },
              iconExtent: { 0: iconClusterUrl },
              enablePicked: true,
              onClick: (e: ClusterClickEvent) => {
                if (e.dataItem && mapInstance.current) {
                  // 可通过dataItem下面的children属性拿到被聚合的所有点
                  // console.log('测试iconClusterLayer click', e.dataItem);
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
          }

          // 发送地图实例就绪事件，供其他组件使用
          const event = new CustomEvent('mapInstanceReady', { detail: mapInstance.current });
          window.dispatchEvent(event);
        } catch (mapvglError) {
          console.error('MapVGL 初始化失败:', mapvglError);
        }
      } catch (initError) {
        console.error('地图初始化失败:', initError);
      }
    };

    initMap();
  }, [center, zoom, iconClusterUrl, iconImageUrl]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};
