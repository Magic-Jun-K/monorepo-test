declare interface BMapGL {
  Map: new (container: string | HTMLElement, options?: MapOptions) => MapInstance;
  Point: new (lng: number, lat: number) => Point;
}

interface DrawingManager {
  open(): void;
  close(): void;
  addEventListener(event: string, handler: () => void): void;
}

declare module 'mapv' {}

declare module 'mapvgl' {
  interface ViewOptions {
    map: BMapGL.Map;
  }

  interface IconClusterOptions {
    minSize?: number;
    maxSize?: number;
  }

  interface ViewInstance {
    addLayer: (layer: LayerInstance) => void;
    removeLayer: (layer: LayerInstance) => void;
    destroy: () => void;
  }

  interface IconClusterLayerInstance {
    setData: (data: ClusterData[]) => void;
  }

  export default class MapVGL {
    static View: new (options: { map: ViewOptions }) => ViewInstance;
    static IconClusterLayer: new (options: IconClusterOptions) => IconClusterLayerInstance;
  }
}

declare global {
  interface Window {
    BMapGL: BMapGL;
    BMapGLLib: {
      DrawingManager?: new (options?: DrawingManagerOptions) => DrawingManager;
    };
    onBMapCallback: () => void;
    mapv: typeof mapv;
    mapvgl: typeof import('mapvgl').default; // 使用模块类型;
  }
}