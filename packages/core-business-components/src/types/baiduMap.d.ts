// 百度地图API类型声明
declare global {
  interface Window {
    BMapGL: typeof BMapGL;
    BMapGLLib: unknown;
    mapvgl: typeof mapvgl;
    onBMapCallback: () => void;
  }

  // mapvgl 类型定义
  namespace mapvgl {
    class View {
      constructor(opts: { map: BMapGL.Map });
      addLayer(layer: Layer): void;
    }

    class Layer {
      setData(data: unknown): void;
    }

    class ClusterLayer extends Layer {
      constructor(opts: {
        minSize?: number;
        maxSize?: number;
        clusterRadius?: number;
        gradient?: Record<number, string>;
        maxZoom?: number;
        minZoom?: number;
        averageCenter?: boolean;
        minPointsForCluster?: number;
        minPoints?: number;
        enablePicked?: boolean;
        showText?: boolean;
        textOptions?: {
          show?: boolean;
          color?: string;
          fontSize?: number;
          offset?: [number, number];
          format?: (count: number) => string | number;
        };
        onClick?: (e: MapVglEvent) => void;
      });
    }

    class IconClusterLayer extends Layer {
      constructor(opts: {
        minSize?: number;
        maxSize?: number;
        clusterRadius?: number;
        gradient?: Record<number, string>;
        maxZoom?: number;
        minZoom?: number;
        averageCenter?: boolean;
        minPointsForCluster?: number;
        enablePicked?: boolean;
        showText?: boolean;
        textOptions?: {
          show?: boolean;
          color?: string;
          fontSize?: number;
          offset?: [number, number];
          format?: (count: number) => string | number;
        };
        iconOptions?: {
          width?: number;
          height?: number;
        };
        iconExtent?: Record<number, string>;
        onClick?: (e: IconClusterEvent) => void;
      });
    }

    class IconLayer extends Layer {
      constructor(opts: {
        width?: number;
        height?: number;
        offset?: [number, number];
        opacity?: number;
        icon?: string;
        enablePicked?: boolean;
        selectedIndex?: number;
        selectedColor?: string;
        autoSelect?: boolean;
        onClick?: (e: MapVglEvent) => void;
        onDblClick?: (e: MapVglEvent) => void;
        onRightClick?: (e: MapVglEvent) => void;
      });
    }

    interface MapVglEvent {
      dataItem?: unknown;
    }

    interface IconClusterEvent extends MapVglEvent {
      dataItem?: {
        geometry: {
          type: string;
          coordinates: [number, number];
        };
        properties?: {
          icon?: string;
          width?: number;
          height?: number;
        };
      };
    }
  }

  // 百度地图GL版本API类型
  namespace BMapGL {
    // 地图类
    class Map {
      constructor(container: string | HTMLElement, opts?: MapOptions);
      centerAndZoom(center: Point, zoom: number): void;
      enableScrollWheelZoom(enable: boolean): void;
      addControl(control: Control): void;
      removeOverlay(overlay: Overlay): void;
      addOverlay(overlay: Overlay): void;
      getViewport(points: Point[]): Viewport;
      setViewport(viewport: Viewport): void;
      panTo(center: Point): void;
      setZoom(zoom: number): void;
      getZoom(): number;
      getCenter(): Point;
      getBounds(): Bounds;
      destroy(): void;
      setDefaultCursor(cursor: string): void;
      openInfoWindow(infoWindow: InfoWindow, point: Point): void;
    }

    // 地图选项
    interface MapOptions {
      minZoom?: number;
      maxZoom?: number;
      maxBounds?: Bounds;
      enableScrollWheelZoom?: boolean;
      enableDragging?: boolean;
      enableDoubleClickZoom?: boolean;
      enableKeyboard?: boolean;
      enableInertialDragging?: boolean;
      enableAutoResize?: boolean;
    }

    // 坐标点类
    class Point {
      constructor(lng: number, lat: number);
      lng: number;
      lat: number;
      equals(other: Point): boolean;
      toString(): string;
    }

    // 地图边界类
    class Bounds {
      constructor(sw: Point, ne: Point);
      getSouthWest(): Point;
      getNorthEast(): Point;
    }

    // 视口
    interface Viewport {
      center: Point;
      zoom: number;
    }

    // 控件基类
    class Control {
      setAnchor(anchor: ControlAnchor): void;
      setOffset(offset: Size): void;
      show(): void;
      hide(): void;
    }

    // 比例尺控件
    class ScaleControl extends Control {
      constructor(opts?: ScaleControlOptions);
    }

    // 比例尺控件选项
    interface ScaleControlOptions {
      anchor?: ControlAnchor;
      offset?: Size;
    }

    // 控件停靠位置
    enum ControlAnchor {
      BMAP_ANCHOR_TOP_LEFT,
      BMAP_ANCHOR_TOP_RIGHT,
      BMAP_ANCHOR_BOTTOM_LEFT,
      BMAP_ANCHOR_BOTTOM_RIGHT,
    }

    // 尺寸类
    class Size {
      constructor(width: number, height: number);
      width: number;
      height: number;
    }

    // 覆盖物基类
    class Overlay {
      setMap(map: Map | null): void;
    }

    // 标注类
    class Marker extends Overlay {
      constructor(point: Point, opts?: MarkerOptions);
      addEventListener(event: string, handler: (...args: unknown[]) => void): void;
      removeEventListener(event: string, handler: (...args: unknown[]) => void): void;
    }

    // 标注选项
    interface MarkerOptions {
      offset?: Size;
      icon?: Icon;
      enableMassClear?: boolean;
      enableDragging?: boolean;
      enableClicking?: boolean;
      raiseOnDrag?: boolean;
      draggingCursor?: string;
      rotation?: number;
      shadow?: Icon;
      title?: string;
    }

    // 图标选项
    interface IconOptions {
      anchor?: Size;
      imageOffset?: Size;
      imageSize?: Size;
      infoWindowAnchor?: Size;
    }

    // 信息窗口类
    class InfoWindow extends Overlay {
      constructor(content: string | HTMLElement, opts?: InfoWindowOptions);
      open(map: Map, point: Point): void;
    }

    // 信息窗口选项
    interface InfoWindowOptions {
      width?: number;
      height?: number;
      maxWidth?: number;
      offset?: Size;
      title?: string;
      enableAutoPan?: boolean;
      enableCloseOnClick?: boolean;
      enableMessage?: boolean;
      message?: string;
    }

    // 本地搜索类
    class LocalSearch {
      constructor(location: Map | Point | string, opts?: LocalSearchOptions);
      search(keyword: string): void;
      searchInBounds(keyword: string, bounds: Bounds): void;
      searchNearby(keyword: string, center: Point, radius: number): void;
      clearResults(): void;
      setMarkersSetCallback(callback: (...args: unknown[]) => void): void;
    }

    // 本地搜索选项
    interface LocalSearchOptions {
      renderOptions?: RenderOptions;
      onSearchComplete?: (results: LocalResult) => void;
      onMarkersSet?: (...args: unknown[]) => void;
      onInfoHtmlSet?: (...args: unknown[]) => void;
      onResultsHtmlSet?: (...args: unknown[]) => void;
      onGetBusListComplete?: (...args: unknown[]) => void;
      onGetBusLineComplete?: (...args: unknown[]) => void;
      onBusListHtmlSet?: (...args: unknown[]) => void;
      onBusLineHtmlSet?: (...args: unknown[]) => void;
      onPolylinesSet?: (...args: unknown[]) => void;
      reqFromClient?: boolean;
    }

    // 渲染选项
    interface RenderOptions {
      map?: Map;
      panel?: string | HTMLElement;
      enableAutoPan?: boolean;
      autoViewport?: boolean;
    }

    // 本地搜索结果
    class LocalResult {
      keyword: string;
      center: Point;
      radius: number;
      bounds: Bounds;
      numPois: number;
      getPoi(index: number): LocalResultPoi;
      getNumPois(): number;
    }

    // 本地搜索结果项
    interface LocalResultPoi {
      title: string;
      point: Point;
      address: string;
      city: string;
      phoneNumber: string;
      postcode: string;
      business: string;
      type: string;
      detailUrl: string;
      uid: string;
      tag: string;
      province: string;
      zone: string;
    }

    // 标签类
    class Label extends Overlay {
      constructor(content: string, opts?: LabelOptions);
    }

    // 标签选项
    interface LabelOptions {
      position?: Point;
      offset?: Size;
    }
  }
}

// 导出类型以供其他模块使用
export type MapInstance = BMapGL.Map;
export type Point = BMapGL.Point;
export type LocalSearch = BMapGL.LocalSearch;
export type LocalResult = BMapGL.LocalResult;
export type LocalResultPoi = BMapGL.LocalResultPoi;
export type Marker = BMapGL.Marker;
