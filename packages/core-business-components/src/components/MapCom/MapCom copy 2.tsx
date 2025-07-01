// import { FC, useEffect, useRef } from 'react';

// import { loadScript } from '@/utils/index';
// import { BASE_URL } from '@/config';
// import { loadBMapScript, loadBMapGLLib } from './utils/bmap';

// interface MapProps {
//   mapParams?: { center: { lng: number; lat: number }; zoom: number };
// }

// interface WorkerPoint {
//   lng: number;
//   lat: number;
// }

// interface ClusterClickEvent {
//   dataItem?: {
//     geometry: {
//       coordinates: [number, number];
//     };
//   };
// }

// // 配置常量
// const MAP_CONFIG = {
//   ICON_CLUSTER: `${BASE_URL}/images/iconCluster.png`,
//   ICON_IMAGE: `${BASE_URL}/images/image.png`,
//   DATA_BOUNDS: [113.25167, 113.42317, 23.10791, 23.09372] as [number, number, number, number], // 数据边界
//   POINT_COUNT: 1000000 // 落点数量
// };

// const MapCom: FC<MapProps> = ({ mapParams }) => {
//   const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
//   const mapRef = useRef<HTMLDivElement>(null);
//   const mapInstance = useRef<typeof window.BMapGL | null>(null);
//   const viewInstance = useRef<InstanceType<(typeof window.mapvgl)['View']> | null>(null);
//   const iconClusterLayerInstance = useRef<InstanceType<(typeof window.mapvgl)['IconClusterLayer']> | null>(null);
//   const workerRef = useRef<Worker | null>(null);
//   // 在组件中添加状态跟踪已加载的数据
//   const allMapData = useRef<any[]>([]);
//   // 添加状态跟踪是否已经开始渲染
//   // const hasStartedRendering = useRef<boolean>(false);
//   // 添加状态跟踪首批数据是否已加载
//   const firstBatchLoaded = useRef<boolean>(false);

//   // 初始化 Web Worker
//   useEffect(() => {
//     workerRef.current = new Worker(new URL('./worker/map.worker.ts', import.meta.url), { type: 'module' });

//     // 修改Worker消息处理
//     workerRef.current.onmessage = e => {
//       if (e.data.type === 'pointsComplete') {
//         // 原有的处理逻辑
//         iconClusterLayerInstance.current?.setData(
//           e.data.points.map((p: WorkerPoint) => ({
//             geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
//             properties: { icon: MAP_CONFIG.ICON_IMAGE, width: 100 / 6, height: 153 / 6 }
//           }))
//         );
//       } else if (e.data.type === 'pointsBatch') {
//         // 处理批次数据
//         const { buffer, count, batch, totalBatches, isLastBatch } = e.data;
//         const pointsArray = new Float64Array(buffer);

//         // 构建当前批次的地图数据
//         const batchData = [];
//         for (let i = 0; i < count; i++) {
//           const lng = pointsArray[i * 2];
//           const lat = pointsArray[i * 2 + 1];
//           batchData.push({
//             geometry: { type: 'Point', coordinates: [lng, lat] },
//             properties: { icon: MAP_CONFIG.ICON_IMAGE, width: 100 / 6, height: 153 / 6 }
//           });
//         }

//         // 添加到总数据集
//         allMapData.current = [...allMapData.current, ...batchData];

//         // 关键优化：每批数据到达后立即渲染
//         // 如果是第一批数据，立即渲染以提供快速反馈
//         if (batch === 0 || !firstBatchLoaded.current) {
//           firstBatchLoaded.current = true;
//           iconClusterLayerInstance.current?.setData(allMapData.current);
//           console.log(`首批数据加载完成，渲染 ${allMapData.current.length} 个点位`);
//         } else {
//           // 对于后续批次，可以控制更新频率，避免频繁渲染导致性能问题
//           // 例如每5个批次更新一次，或者根据批次大小动态调整
//           if (batch % 5 === 0 || isLastBatch) {
//             iconClusterLayerInstance.current?.setData(allMapData.current);
//             console.log(`批次 ${batch + 1}/${totalBatches} 加载完成，当前共 ${allMapData.current.length} 个点位`);
//           }
//         }

//         // 如果是最后一批，可以做一些清理工作
//         if (isLastBatch) {
//           console.log(`所有数据加载完成，共 ${allMapData.current.length} 个点位`);
//           // 确保最后一次渲染包含所有数据
//           iconClusterLayerInstance.current?.setData(allMapData.current);
//         }
//       }
//     };
//     return () => workerRef.current?.terminate();
//   }, []);

//   // 初始化地图
//   useEffect(() => {
//     const initMap = async () => {
//       try {
//         // 加载百度地图资源
//         await loadBMapScript();
//         await loadBMapGLLib();

//         // Ensure container is properly initialized
//         if (!mapRef.current || !mapRef.current.clientWidth || !mapRef.current.clientHeight) {
//           await new Promise(resolve => setTimeout(resolve, 100));
//           if (!mapRef.current) return;
//         }

//         // 初始化地图实例
//         mapInstance.current = new window.BMapGL.Map(mapRef.current, {
//           maxBounds: new window.BMapGL.Bounds(new window.BMapGL.Point(113.2, 23.0), new window.BMapGL.Point(113.5, 23.2)),
//           enableAutoResize: true
//         }); // 创建地图实例
//         mapInstance.current.centerAndZoom(new window.BMapGL.Point(center.lng, center.lat), zoom); // 设置中心点和缩放级别
//         mapInstance.current.enableScrollWheelZoom(true); // 启用滚轮缩放
//         mapInstance.current.addControl(new window.BMapGL.ScaleControl()); // 添加比例尺控件

//         // 初始化 MapVGL
//         await loadScript('https://unpkg.com/mapvgl/dist/mapvgl.min.js');
//         viewInstance.current = new window.mapvgl.View({ map: mapInstance.current });

//         console.log('测试mapvgl', window.mapvgl);
//         // 创建图层
//         iconClusterLayerInstance.current = new window.mapvgl.IconClusterLayer({
//           minSize: 25,
//           maxSize: 40,
//           clusterRadius: 200,
//           textOptions: {
//             fontSize: 12,
//             color: '#fff',
//             format: (count: number) => (count >= 1e4 ? `${(count / 1e3).toFixed(0)}k` : count.toString())
//           },
//           iconOptions: { width: 100, height: 100 },
//           iconExtent: { 0: MAP_CONFIG.ICON_CLUSTER },
//           enablePicked: true,
//           onClick: (e: ClusterClickEvent) => {
//             if (e.dataItem) {
//               // 可通过dataItem下面的children属性拿到被聚合的所有点
//               console.log('测试iconClusterLayer click', e.dataItem);
//               const [lng, lat] = e.dataItem.geometry.coordinates;
//               mapInstance.current.panTo(new window.BMapGL.Point(lng, lat));
//               mapInstance.current?.setZoom(mapInstance.current.getZoom() + 2);
//             }
//           }
//         });
//         viewInstance.current.addLayer(iconClusterLayerInstance.current);

//         // 启动数据生成
//         workerRef.current?.postMessage({
//           type: 'generatePoints',
//           count: MAP_CONFIG.POINT_COUNT,
//           bounds: MAP_CONFIG.DATA_BOUNDS,
//           batchSize: 100000 // 减小批次大小，加快首批数据显示
//         });

//         // 添加视口变化监听，优先加载视口内数据
//         mapInstance.current.addEventListener('zoomend', handleViewportChange);
//         mapInstance.current.addEventListener('dragend', handleViewportChange);

//         // 初始加载时触发一次
//         handleViewportChange();
//       } catch (error) {
//         console.error('初始化失败:', error);
//       }
//     };
//     initMap();

//     // 处理视口变化
//     const handleViewportChange = () => {
//       if (!mapInstance.current || !workerRef.current) return;

//       // 获取当前视口范围
//       const bounds = mapInstance.current.getBounds();
//       const sw = bounds.getSouthWest();
//       const ne = bounds.getNorthEast();

//       // 发送消息给Worker，请求优先加载视口内的数据
//       workerRef.current.postMessage({
//         type: 'updateViewport',
//         viewport: [sw.lng, ne.lng, sw.lat, ne.lat]
//       });
//     };

//     return () => {
//       // 清理事件监听
//       if (mapInstance.current) {
//         mapInstance.current.removeEventListener('zoomend', handleViewportChange);
//         mapInstance.current.removeEventListener('dragend', handleViewportChange);
//       }

//       workerRef.current?.terminate();
//       workerRef.current = null;

//       mapInstance.current?.destroy();
//       mapInstance.current = null;

//       viewInstance.current?.destroy();
//       viewInstance.current = null;

//       iconClusterLayerInstance.current?.destroy();
//       iconClusterLayerInstance.current = null;
//     };
//   }, [center, zoom]);

//   return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
// };
// export default MapCom;
