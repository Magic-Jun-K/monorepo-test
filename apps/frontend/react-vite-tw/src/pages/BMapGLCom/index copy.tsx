import { FC, useEffect, useRef } from 'react';

import type { MapInstance } from '@/types/baiduMap';

interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
}

class MapLoader {
  loadScript() {
    const AK = 'VyYLcISnIl9Pkivq8WD8TmNMjzkP76mZ';
    const BMap_URL =
      '//api.map.baidu.com/api?v=3.0&type=webgl&ak=' + AK + '&callback=onBMapCallback';
    return new Promise((resolve, reject) => {
      // 如果已加载直接返回
      if (typeof window.BMapGL !== 'undefined') {
        return resolve(window.BMapGL);
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
      scriptNode.addEventListener('error', () => {
        reject(new Error('百度地图脚本加载失败'));
      });
      document.body.appendChild(scriptNode);
    });
  }
}

const MapComponent: FC<MapProps> = ({ mapParams }) => {
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<MapInstance | null>(null);

  useEffect(() => {
    console.log('测试BMapGL', window.BMapGL);
    const init = async () => {
      await new MapLoader().loadScript();
      // 检查百度地图API是否加载完成
      if (!window.BMapGL) return;

      // 初始化地图
      if (!mapRef.current) return;
      map.current = new window.BMapGL.Map(mapRef.current as HTMLElement);
      console.log('测试map', map.current);
      const centerPoint = new window.BMapGL.Point(center.lng, center.lat);
      map.current.centerAndZoom(centerPoint, zoom); // 设置缩放级别
      map.current.enableScrollWheelZoom(true); // 启用滚轮缩放

      const markerPoint = new window.BMapGL.Point(113.30374, 23.18675);
      const marker = new window.BMapGL.Marker(markerPoint); // 创建标注
      map.current.addOverlay(marker); // 将标注添加到地图中
    };
    init();

    // 在组件卸载时，销毁地图实例
    return () => {
      map.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};
export default MapComponent;
