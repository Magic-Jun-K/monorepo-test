import { FC, useEffect, useRef } from 'react';

interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
}

interface BMapPoint {
  lng: number;
  lat: number;
  equals(other: BMapPoint): boolean;
  toString(): string;
}

interface BMapMap {
  centerAndZoom(center: BMapPoint, zoom: number): void;
  enableScrollWheelZoom(enable: boolean): void;
  destroy(): void;
}

interface BMapConstructor {
  new (container: HTMLDivElement): BMapMap;
  Point: new (lng: number, lat: number) => BMapPoint;
}

interface BMapType {
  Map: BMapConstructor;
  Point: new (lng: number, lat: number) => BMapPoint;
}

declare global {
  interface Window {
    BMap: BMapType;
  }
}

const MapComponent: FC<MapProps> = ({ mapParams }) => {
  const { center = { lng: 113.33107, lat: 23.11204 }, zoom = 14 } = mapParams || {};
  const mapRef = useRef<HTMLDivElement>(null);
  const BMapRef = useRef<typeof window.BMap | null>(null);
  const map = useRef<BMapMap | null>(null);

  useEffect(() => {
    // 检查百度地图API是否加载完成
    if (!window.BMap) return;
    BMapRef.current = window.BMap;

    // 初始化地图
    if (mapRef.current && BMapRef.current) {
      map.current = new BMapRef.current.Map(mapRef.current);
      const centerPoint = new BMapRef.current.Point(center.lng, center.lat);
      map.current.centerAndZoom(centerPoint, zoom); // 设置缩放级别
      map.current.enableScrollWheelZoom(true); // 启用滚轮缩放
    }

    // 在组件卸载时，销毁地图实例
    return () => {
      map.current = null;
    };
  }, [center.lng, center.lat, zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;
