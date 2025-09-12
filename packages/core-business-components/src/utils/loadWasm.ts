/**
 * 智能加载 WASM 文件的工具函数
 * 支持多种环境下的 WASM 加载：
 * 1. 开发环境 (Vite dev server)
 * 2. 生产环境 (打包后的静态文件)
 * 3. 作为独立包使用时
 */

// 判断是否在浏览器环境
const isBrowser = typeof window !== 'undefined';

/**
 * 获取 WASM 文件的完整 URL
 * @param fileName WASM 文件名 (如 'release.wasm')
 * @returns 完整的 URL 字符串
 */
export async function getWasmUrl(fileName: string): Promise<string> {
  // 在浏览器环境中
  if (isBrowser) {
    // 首先尝试从 core-business-components 包中加载
    try {
      // 尝试通过模块系统导入
      const module = await import(`@eggshell/core-business-components/wasm/${fileName}`);
      if (module.default) {
        return module.default;
      }
    } catch (e) {
      console.warn(`通过模块系统加载 ${fileName} 失败:`, e);
    }

    // 如果模块导入失败，尝试直接从 public 目录加载
    const pathsToTry = [
      `/wasm/${fileName}`, // 默认路径
      `/core-business-components/wasm/${fileName}`, // 包路径
      fileName // 相对路径
    ];

    for (const path of pathsToTry) {
      try {
        const url = new URL(path, window.location.origin).toString();
        // 检查文件是否存在
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          return url;
        }
      } catch (e) {
        console.warn(`尝试路径 ${path} 失败:`, e);
      }
    }

    // 如果所有路径都失败，抛出错误
    throw new Error(`无法找到 WASM 文件: ${fileName}`);
  }

  // 在 Node.js 环境中
  throw new Error('此函数仅支持在浏览器环境中使用');
}

/**
 * 加载 WASM 模块
 * @param fileName WASM 文件名
 * @param importObject 导入对象
 * @returns WASM 实例
 */
export async function loadWasm(
  fileName: string,
  importObject: WebAssembly.Imports = {}
): Promise<WebAssembly.Instance> {
  try {
    const url = await getWasmUrl(fileName);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`加载 WASM 文件失败: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.compile(buffer);
    const instance = await WebAssembly.instantiate(module, importObject);
    return instance;
  } catch (error) {
    console.error('WASM 加载失败:', error);
    throw error;
  }
}

// 默认导出
export default {
  getWasmUrl,
  loadWasm
};