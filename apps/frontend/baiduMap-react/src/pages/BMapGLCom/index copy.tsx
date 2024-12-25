import React, { useEffect, useRef } from 'react';

interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
}

declare global {
  interface Window {
    BMapGL: any;
    BMapLib: any;
    onBMapCallback: any;
  }
}

class MapLoader {
  loadScript() {
    const AK = 'VyYLcISnIl9Pkivq8WD8TmNMjzkP76mZ';
    const BMap_URL = '//api.map.baidu.com/api?v=3.0&type=webgl&ak=' + AK + '&callback=onBMapCallback';
    return new Promise((resolve, reject) => {
      // 如果已加载直接返回
      if (typeof window.BMapGL !== 'undefined') {
        resolve(window.BMapGL);
        return true;
      }
      console.log('测试window', window);
      console.log('初始化百度地图脚本...');
      // 百度地图异步加载回调处理
      window.onBMapCallback = function () {
        console.log('百度地图脚本初始化成功...');
        resolve(window.BMapGL);
      };
      // 插入script脚本
      const scriptNode = document.createElement('script');
      scriptNode.setAttribute('type', 'text/javascript');
      scriptNode.setAttribute('src', BMap_URL);
      // scriptNode.onload = () => {
      //   console.log('百度地图脚本加载成功');
      // };
      scriptNode.onerror = () => {
        reject(new Error('百度地图脚本加载失败'));
      };
      document.body.appendChild(scriptNode);
    });
  }
}

const MapComponent: React.FC<MapProps> = ({ mapParams }) => {
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  const BMapGLRef = useRef<typeof window.BMapGL | null>(null);
  const map = useRef<typeof window.BMapGL | null>(null);

  // const tempC = useRef(1);

  // console.log('测试BMapGL外面', window.BMapGL);

  useEffect(() => {
    // if (tempC.current === 1) {
    //   tempC.current = 2;
    // } else {
    //   return
    // }
    console.log('测试BMapGL', window.BMapGL);
    const init = async () => {
      await new MapLoader().loadScript();
      // 检查百度地图API是否加载完成
      if (!window.BMapGL) return;
      BMapGLRef.current = window.BMapGL;

      // 初始化地图
      map.current = new window.BMapGL.Map(mapRef.current);
      console.log('测试map', map.current);
      const centerPoint = new window.BMapGL.Point(center.lng, center.lat);
      map.current.centerAndZoom(centerPoint, zoom); // 设置缩放级别
      map.current.enableScrollWheelZoom(true); // 启用滚轮缩放

      const marker = new BMapGLRef.current.Marker({ lng: 113.30374, lat: 23.18675 }); // 创建标注
      map.current.addOverlay(marker); // 将标注添加到地图中
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
