import { FC, useEffect, useRef } from 'react';

interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
}

declare global {
  interface Window {
    BMap: any;
  }
}

const MapComponent: FC<MapProps> = ({ mapParams }) => {
  // console.log('测试mapParams', mapParams);
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  const BMapRef = useRef<typeof window.BMap | null>(null);
  const map = useRef<typeof window.BMap | null>(null);

  useEffect(() => {
    console.log('测试BMap', window.BMap);
    // 检查百度地图API是否加载完成
    if (!window.BMap) return;
    BMapRef.current = window.BMap;

    // 初始化地图
    map.current = new BMapRef.current.Map(mapRef.current);
    console.log('测试map', map.current);
    const centerPoint = new BMapRef.current.Point(center.lng, center.lat);
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
