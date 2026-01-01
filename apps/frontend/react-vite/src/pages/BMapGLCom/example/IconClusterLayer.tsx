// /**
//  * @description: MapVgl 示例：点聚合图
//  */
// import { FC, useEffect, useRef } from 'react';

// import { loadScript } from '@/utils/index';
// import { generateRandomCoordinates } from '../utils';

// interface MapProps {
//   mapParams?: { center: { lng: number; lat: number }; zoom: number };
// }

// const MapComponent: FC<MapProps> = ({ mapParams }) => {
//   const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
//   const mapRef = useRef<HTMLDivElement>(null);
//   const BMapGLRef = useRef<typeof window.BMapGL | null>(null);
//   const map = useRef<typeof window.BMapGL | null>(null);
//   // const BMapGLLibRef = useRef<typeof window.BMapGLLib | null>(null);
//   const mapViewRef = useRef<typeof window.mapvgl | null>(null);

//   useEffect(() => {
//     console.log('测试mapvgl', window.mapvgl);
//     const init = async () => {
//       // 检查百度地图API是否加载完成
//       if (!window.BMapGL) return;
//       BMapGLRef.current = window.BMapGL;

//       // 初始化地图
//       map.current = new BMapGLRef.current.Map(mapRef.current); // 1.创建地图实例
//       console.log('测试map', map.current);
//       const centerPoint = new BMapGLRef.current.Point(center.lng, center.lat); // 2.设置中心点坐标
//       map.current.centerAndZoom(centerPoint, zoom); // 3.设置中心点和缩放级别
//       map.current.enableScrollWheelZoom(true); // 4.启用滚轮缩放
//       // map.current.setMapType(window.BMAP_SATELLITE_MAP); // 设置地图类型为卫星模式

//       const scaleCtrl = new BMapGLRef.current.ScaleControl(); // 比例尺控件
//       map.current.addControl(scaleCtrl); // 5.添加比例尺控件

//       // await loadScript('https://unpkg.com/mapvgl/dist/mapvgl.min.js');
//       await loadScript('https://unpkg.com/mapvgl@1.0.0-beta.191/dist/mapvgl.min.js');
//       mapViewRef.current = new window.mapvgl.View({
//         map: map.current
//       })!;

//       // 生成随机落点
//       const randomPoints = generateRandomCoordinates(113.25167, 113.42317, 23.10791, 23.09372, 100000); // 生成10000个随机坐标
//       // console.log('测试randomPoints', randomPoints);

//       // 构造数据
//       const data = randomPoints.map((item: { lng: number; lat: number }) => {
//         return {
//           geometry: {
//             type: 'Point',
//             coordinates: [item.lng, item.lat]
//           },
//           properties: {
//             icon: 'http://localhost:7100/image.png',
//             width: 100 / 6,
//             height: 153 / 6
//           }
//         };
//       });

//       const iconClusterLayer = new window.mapvgl.IconClusterLayer({
//         minSize: 25,
//         maxSize: 40,
//         clusterRadius: 200,
//         showText: true,
//         maxZoom: 19,
//         minZoom: 4,
//         textOptions: {
//           fontSize: 12,
//           color: '#fff',
//           // format: function (count: number) {
//           //   return count;
//           // },
//           // 格式化数字显示
//           format: function (count: number) {
//             return count >= 10000 ? Math.round(count / 1000) + 'k' : count >= 1000 ? Math.round(count / 100) / 10 + 'k' : count;
//           },
//           offset: [0, 0]
//         },
//         iconOptions: {
//           width: 100,
//           height: 100
//         },
//         enablePicked: true,
//         iconExtent: {
//           0: 'http://localhost:7100/iconCluster.png'
//           // 1000: 'http://localhost:7100/iconCluster.png',
//           // 10000: 'http://localhost:7100/iconCluster.png',
//         },
//         onClick(e: any) {
//           if (e.dataItem) {
//             // 可通过dataItem下面的children属性拿到被聚合的所有点
//             console.log('测试iconClusterLayer click', e.dataItem);
//             const _point = e.dataItem.geometry.coordinates;
//             map.current.panTo({ lng: _point[0], lat: _point[1] });
//           }
//         }
//       });

//       mapViewRef.current.addLayer(iconClusterLayer);
//       iconClusterLayer.setData(data);

//       // 在地图上创建一个聚合器实例
//       // const markerClusterer = new BMapLibRef.current.MarkerClusterer(map.current, {});

//       // 将标记点加入聚合器
//       // markerClusterer.addMarkers(markers);
//     };
//     init();

//     // 在组件卸载时，销毁地图实例
//     return () => {
//       map.current = null;
//     };
//   }, []);

//   return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
// };

// export default MapComponent;
