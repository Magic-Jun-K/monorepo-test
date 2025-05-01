import { useEffect } from 'react';
// import CanvasKitInit from 'canvaskit-wasm';
// import type { CanvasKit, FontMgr as SkFontManager } from 'canvaskit-wasm';
// import type { CanvasKit } from 'canvaskit-wasm';

import './index.css';

// declare global {
//   interface Window {
//     BMapGL: any;
//   }
// }

const { BMapGL } = window;
// const canvasKitPromise: Promise<CanvasKit> = CanvasKitInit({
//   locateFile: (file: string): string => `https://unpkg.com/canvaskit-wasm@latest/bin/${file}`,
// })

export default () => {
  useEffect(() => {
    // console.log('测试BMapGL', BMapGL, new BMapGL.Point(116.404449, 39.914889));
    // 百度地图API功能
    const map = new BMapGL.Map('testMap'); // 创建Map实例
    map.centerAndZoom('广州', 15); // 初始化地图,用城市名设置地图中心点
  }, []);

  return (
    <>
      <div id="testMap"></div>
      <div className="Test">测试</div>
    </>
  );
};
