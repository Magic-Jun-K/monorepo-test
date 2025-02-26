import { FC, useEffect, useRef } from 'react';

import { loadScript } from '@/utils/index';
import { generateRandomCoordinates } from './utils';
// import wenhuaguji from '@/assets/images/test/wenhuaguji.png';
// const wenhuaguji = require('@/assets/images/test/wenhuaguji.png');

interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
}

declare global {
  interface Window {
    BMapGL: any;
    BMapLib: any;
    // onBMapCallback: () => void;
    onBMapCallback: any;
    // BMAP_SATELLITE_MAP: any;
    mapv: any;
    mapvgl: any;
  }
}

let scriptPromise: Promise<any> | null = null;
const loadBMapScript = () => {
  const AK = 'VyYLcISnIl9Pkivq8WD8TmNMjzkP76mZ';
  // const BMap_URL = `//api.map.baidu.com/api?v=3.0&type=webgl&ak=${AK}&libraries=DrawingManager,Heatmap&callback=onBMapCallback`;
  const BMap_URL = `//api.map.baidu.com/api?v=3.0&type=webgl&ak=${AK}&callback=onBMapCallback`;

  console.log('测试scriptPromise', scriptPromise);

  if (scriptPromise) {
    console.log('百度地图脚本已加载，返回已加载的 Promise');
    return scriptPromise;
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      console.log('初始化百度地图脚本...');
      // 百度地图异步加载回调处理
      window.onBMapCallback = function () {
        console.log('百度地图脚本初始化成功...');
        console.log('测试onBMapCallback', window.BMapGL);
        resolve(window.BMapGL);
      };

      loadScript(BMap_URL)
        .then(() => {
          if (!window.BMapGL) {
            reject(new Error('BMapGL is not defined after script load'));
          }
        })
        .catch(err => {
          console.error('百度地图加载失败', err);
        });
    });
  }
  return scriptPromise;
};

const MapComponent: FC<MapProps> = ({ mapParams }) => {
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  const BMapGLRef = useRef<typeof window.BMapGL | null>(null);
  const map = useRef<typeof window.BMapGL | null>(null);
  const BMapLibRef = useRef<typeof window.BMapLib | null>(null);
  const mapViewRef = useRef<typeof window.mapvgl | null>(null);

  useEffect(() => {
    console.log('测试mapv', window.mapv);
    const init = async () => {
      const BMapGL = await loadBMapScript();
      console.log('测试BMapGL', BMapGL);
      console.log('测试window.BMapGL999', window.BMapGL);
      // 检查百度地图API是否加载完成
      if (!window.BMapGL) return;
      BMapGLRef.current = window.BMapGL;

      if (!window.BMapLib) return;
      console.log('测试BMapLib', window.BMapLib);
      BMapLibRef.current = window.BMapLib;

      // 初始化地图
      map.current = new BMapGLRef.current.Map(mapRef.current); // 1.创建地图实例
      console.log('测试map', map.current);
      const centerPoint = new BMapGLRef.current.Point(center.lng, center.lat); // 2.设置中心点坐标
      map.current.centerAndZoom(centerPoint, zoom); // 3.设置中心点和缩放级别
      map.current.enableScrollWheelZoom(true); // 4.启用滚轮缩放
      // map.current.setMapType(window.BMAP_SATELLITE_MAP); // 设置地图类型为卫星模式

      const scaleCtrl = new BMapGLRef.current.ScaleControl(); // 比例尺控件
      map.current.addControl(scaleCtrl); // 5.添加比例尺控件

      mapViewRef.current = new window.mapvgl.View({
        map: map.current
      });
      console.log('测试mapViewRef', mapViewRef.current);

      // const marker = new BMapGLRef.current.Marker({ lng: 113.32769, lat: 23.12522 }); // 创建标注
      // map.current.addOverlay(marker); // 将标注添加到地图中
      // marker.addEventListener('click', function () {
      //   alert('点击了标注');
      // });

      // const markers: any = [];
      // 生成随机落点
      const randomPoints = generateRandomCoordinates(113.25167, 113.42317, 23.10791, 23.09372, 10000); // 生成100个随机坐标
      // console.log('测试randomPoints', randomPoints);

      // randomPoints.forEach(({ lng, lat }) => {
      //   const point = new BMapGLRef.current.Point(lng, lat);
      //   const marker = new BMapGLRef.current.Marker(point);
      //   markers.push(marker);
      //   map.current.addOverlay(marker); // 将标记添加到地图上
      // });

      // 使用 Canvas Overlay 来渲染标注
      // const canvasOverlay = new CanvasOverlay(randomPoints);
      // map.current.addOverlay(canvasOverlay); // 添加Canvas图层
      console.log('测试BMapLibRef.current', BMapLibRef.current);

      // 构造数据
      const data = randomPoints.map((item: { lng: number; lat: number }) => {
        return {
          geometry: {
            type: 'Point',
            coordinates: [item.lng, item.lat]
          }
          // properties: {
          //     icon: 'http://localhost:7000/image.png'
          // }
        };
      });

      const layer = new window.mapvgl.IconLayer({
        width: 100 / 6,
        height: 153 / 6,
        // offset: [0, -153 / 12],
        // offset: function (item) {
        //   return item.geometry.properties.offset;
        // },
        opacity: 0.8,
        icon: 'http://localhost:7000/image.png',
        enablePicked: true, // 是否可以拾取
        selectedIndex: -1, // 选中项
        // selectedColor: '#ff0000', // 选中项颜色
        // autoSelect: true, // 根据鼠标位置来自动设置选中项
        onClick: (e: any) => {
          // 点击事件
          console.log('click', e);
        }
        // onDblClick: (e: any) => {
        //   console.log('double click', e);
        // },
        // onRightClick: (e: any) => {
        //   console.log('right click', e);
        // }
      });
      mapViewRef.current.addLayer(layer);
      layer.setData(data);

      map.current.setDefaultCursor('default');

      // 在地图上创建一个聚合器实例
      // const markerClusterer = new BMapLibRef.current.MarkerClusterer(map.current, {});

      // 将标记点加入聚合器
      // markerClusterer.addMarkers(markers);
    };
    init();

    // 在组件卸载时，销毁地图实例
    return () => {
      map.current = null;
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;
