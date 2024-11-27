import React, { useEffect, useRef } from 'react';

interface MapProps {
  center: { lng: number; lat: number };
  zoom: number;
}

const MapComponent: React.FC<MapProps> = ({ center, zoom }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('测试BMap', window.BMap);
    // 检查百度地图API是否加载完成
    if (!window.BMap) return;

    // 初始化地图
    const map = new window.BMap.Map(mapRef.current);
    const point = new window.BMap.Point(center.lng, center.lat);
    map.centerAndZoom(point, zoom);
    map.enableScrollWheelZoom(true);

    // const centerPoint = new BMapGL.Point(113.33107, 23.11204);
    // map.centerAndZoom(centerPoint, 12); // 设置缩放级别
    // map.enableScrollWheelZoom(true); // 启用滚轮缩放

    // 清理函数，在组件卸载时销毁地图实例
    // return () => {
    //   map.destroy();
    // };
  }, [center, zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;
