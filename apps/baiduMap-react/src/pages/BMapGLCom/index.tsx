import React, { useEffect, useRef } from 'react';

interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
}

declare global {
  interface Window {
    BMapGL: any;
  }
}

const MapComponent: React.FC<MapProps> = ({ mapParams }) => {
  // console.log('测试mapParams', mapParams);
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  const BMapGLRef = useRef<typeof window.BMapGL | null>(null);
  const map = useRef<typeof window.BMapGL | null>(null);

  useEffect(() => {
    console.log('测试BMapGL', window.BMapGL);
    // 检查百度地图API是否加载完成
    if (!window.BMapGL) return;
    BMapGLRef.current = window.BMapGL;

    // 初始化地图
    map.current = new BMapGLRef.current.Map(mapRef.current);
    console.log('测试map', map.current);
    const centerPoint = new BMapGLRef.current.Point(center.lng, center.lat);
    map.current.centerAndZoom(centerPoint, zoom); // 设置缩放级别
    map.current.enableScrollWheelZoom(true); // 启用滚轮缩放

    // 在组件卸载时，销毁地图实例
    return () => {
      map.current = null;
    };
  }, [mapParams]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;
