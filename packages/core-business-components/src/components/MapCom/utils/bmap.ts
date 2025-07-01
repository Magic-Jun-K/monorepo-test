import { loadScript } from '@/utils/loadScript';
import { loadCSS } from '@/utils/loadCSS';

// 配置常量
const MAP_CONFIG = {
  AK: 'VyYLcISnIl9Pkivq8WD8TmNMjzkP76mZ'
};

// 用于存储脚本加载Promise的全局变量
let scriptPromise: Promise<unknown> | null = null;

/**
 * 加载百度地图脚本及相关资源
 * @returns Promise<unknown>
 */
export const loadBMapScript = () => {
  console.log('测试scriptPromise', scriptPromise);

  if (scriptPromise) {
    console.log('BMapGL 已加载，返回已加载的');
    return scriptPromise;
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      // 百度地图异步加载回调处理
      window.onBMapCallback = function () {
        if (window.BMapGL) {
          console.log('BMapGL 初始化完成', window.BMapGL);
          resolve(window.BMapGL);
        } else {
          reject(new Error('BMapGL 未定义'));
        }
      };

      loadScript(
        `//api.map.baidu.com/api?v=3.0&type=webgl&ak=${MAP_CONFIG.AK}&callback=onBMapCallback`
      ).catch(reject);
    });
  }
  return scriptPromise;
};

/**
 * 加载BMapGLLib
 * @returns Promise<void>
 */
export const loadBMapGLLib = async () => {
  /* BMapLib */
  // loadCSS('https://huiyan-fe.github.io/BMap-JavaScript-library/src/DrawingManager/DrawingManager.min.css');
  // loadScript('https://huiyan-fe.github.io/BMap-JavaScript-library/src/DrawingManager/DrawingManager.min.js');
  /* BMapGLLib */
  await Promise.all([
    loadScript(
      'https://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js'
    ),
    loadCSS(
      'https://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.css'
    )
  ]);
};
