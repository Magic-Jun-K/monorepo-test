// /*
//  * @description: MapVgl 示例：渲染落点
//  */
// import { FC, useEffect, useRef } from 'react';

// // import { loadScript } from '@/utils/index';
// import { generateRandomCoordinates } from '../utils';

// interface MapProps {
//   mapParams?: { center: { lng: number; lat: number }; zoom: number };
// }

// const MapComponent: FC<MapProps> = ({ mapParams }) => {
//   const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
//   const mapRef = useRef<HTMLDivElement>(null);
//   const BMapGLRef = useRef<typeof window.BMapGL | null>(null);
//   const map = useRef<typeof window.BMapGL | null>(null);
//   const mapViewRef = useRef<typeof window.mapvgl | null>(null);

//   useEffect(() => {
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

//       // MapVgl 初始化
//       mapViewRef.current = new window.mapvgl.View({
//         map: map.current
//       });
//       console.log('测试mapViewRef', mapViewRef.current);

//       // 示例：百度地图原生使用 DOM 渲染
//       // const markers: any = [];
//       // 生成随机落点
//       const randomPoints = generateRandomCoordinates(113.25167, 113.42317, 23.10791, 23.09372, 10000); // 生成100个随机坐标
//       // console.log('测试randomPoints', randomPoints);

//       // randomPoints.forEach(({ lng, lat }) => {
//       //   const point = new BMapGLRef.current.Point(lng, lat);
//       //   const marker = new BMapGLRef.current.Marker(point);
//       //   markers.push(marker);
//       //   map.current.addOverlay(marker); // 将标记添加到地图上
//       // });

//       // 示例：MapV 使用 Canvas 渲染
//       // 构造数据
//       const data = randomPoints.map((item: { lng: number; lat: number }) => {
//         return {
//           geometry: {
//             type: 'Point',
//             coordinates: [item.lng, item.lat]
//           }
//           // properties: {
//           //     icon: 'http://localhost:7100/image.png'
//           // }
//         };
//       });

//       const layer = new window.mapvgl.IconLayer({
//         width: 100 / 6,
//         height: 153 / 6,
//         // offset: [0, -153 / 12],
//         // offset: function (item) {
//         //   return item.geometry.properties.offset;
//         // },
//         opacity: 0.8,
//         icon: 'http://localhost:7100/image.png',
//         enablePicked: true, // 是否可以拾取
//         selectedIndex: -1, // 选中项
//         // selectedColor: '#ff0000', // 选中项颜色
//         // autoSelect: true, // 根据鼠标位置来自动设置选中项
//         onClick: (e: any) => {
//           // 点击事件
//           console.log('click', e);
//         }
//         // onDblClick: (e: any) => {
//         //   console.log('double click', e);
//         // },
//         // onRightClick: (e: any) => {
//         //   console.log('right click', e);
//         // }
//       });
//       mapViewRef.current.addLayer(layer);
//       layer.setData(data);

//       map.current.setDefaultCursor('default');
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
