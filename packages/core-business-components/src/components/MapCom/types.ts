export interface MapProps {
  mapParams?: { center: { lng: number; lat: number }; zoom: number };
  iconClusterUrl: string;
  iconImageUrl: string;
}

export interface WorkerPoint {
  lng: number;
  lat: number;
}

export interface MapVGLPoint {
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    icon: string;
    width: number;
    height: number;
  };
}

export interface ClusterClickEvent {
  dataItem?: {
    geometry: {
      coordinates: [number, number];
    };
  };
}
