import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { loadScript } from '@/utils/loadScript';
import { loadCSS } from '@/utils/loadCSS';

// Mock依赖
vi.mock('@/utils/loadScript');
vi.mock('@/utils/loadCSS');

describe('bmap utils', () => {
  beforeEach(() => {
    // 清理全局状态
    (window as any).onBMapCallback = undefined;
    (window as any).BMapGL = undefined;
    
    // 重置模块缓存，确保每次测试都重新导入模块
    vi.resetModules();
    
    // 清理所有mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 清理全局状态
    (window as any).onBMapCallback = undefined;
    (window as any).BMapGL = undefined;
    
    // 重置模块缓存
    vi.resetModules();
  });

  describe('loadBMapScript', () => {
    it('应该成功加载百度地图脚本', async () => {
      // 重新导入模块以确保没有缓存
      const { loadBMapScript } = await import('./bmap');
      
      // Mock loadScript返回成功的Promise
      (loadScript as any).mockResolvedValue(undefined);
      
      // 创建一个Promise来模拟异步回调
      const loadPromise = loadBMapScript();
      
      // 模拟百度地图回调
      (window as any).BMapGL = { version: '3.0' };
      if ((window as any).onBMapCallback) {
        (window as any).onBMapCallback();
      }
      
      // 等待加载完成
      const result = await loadPromise;
      
      expect(result).toEqual({ version: '3.0' });
      expect(loadScript).toHaveBeenCalledWith(
        expect.stringContaining('api.map.baidu.com/api')
      );
    });

    it('应该在BMapGL未定义时拒绝Promise', async () => {
      // 重新导入模块以确保没有缓存
      const { loadBMapScript } = await import('./bmap');
      
      // Mock loadScript返回成功的Promise
      (loadScript as any).mockResolvedValue(undefined);
      
      // 创建一个Promise来模拟异步回调
      const loadPromise = loadBMapScript();
      
      // 模拟百度地图回调但不设置BMapGL
      if ((window as any).onBMapCallback) {
        (window as any).onBMapCallback();
      }
      
      // 等待加载完成
      await expect(loadPromise).rejects.toThrow('BMapGL 未定义');
    });

    it('应该在脚本加载失败时拒绝Promise', async () => {
      // 重新导入模块以确保没有缓存
      const { loadBMapScript } = await import('./bmap');
      
      // Mock loadScript返回失败的Promise
      (loadScript as any).mockRejectedValue(new Error('加载失败'));
      
      // 创建一个Promise来模拟异步回调
      const loadPromise = loadBMapScript();
      
      // 等待加载完成
      await expect(loadPromise).rejects.toThrow('加载失败');
    });

    it('应该缓存已加载的脚本Promise', async () => {
      // 重新导入模块以确保没有缓存
      const { loadBMapScript } = await import('./bmap');
      
      // Mock loadScript返回成功的Promise
      (loadScript as any).mockResolvedValue(undefined);
      
      // 第一次调用
      const firstPromise = loadBMapScript();
      
      // 模拟百度地图回调
      (window as any).BMapGL = { version: '3.0' };
      if ((window as any).onBMapCallback) {
        (window as any).onBMapCallback();
      }
      
      await firstPromise;
      
      // 第二次调用应该返回相同的Promise
      const secondPromise = loadBMapScript();
      
      expect(firstPromise).toBe(secondPromise);
    });
  });

  describe('loadBMapGLLib', () => {
    it('应该成功加载BMapGLLib资源', async () => {
      // 重新导入模块以确保没有缓存
      const { loadBMapGLLib } = await import('./bmap');
      
      // Mock loadScript和loadCSS返回成功的Promise
      (loadScript as any).mockResolvedValue(undefined);
      (loadCSS as any).mockResolvedValue(undefined);
      
      // 调用loadBMapGLLib
      await loadBMapGLLib();
      
      // 验证loadScript和loadCSS被调用
      expect(loadScript).toHaveBeenCalledWith(
        'https://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js'
      );
      expect(loadCSS).toHaveBeenCalledWith(
        'https://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.css'
      );
    });

    it('应该在资源加载失败时拒绝Promise', async () => {
      // 重新导入模块以确保没有缓存
      const { loadBMapGLLib } = await import('./bmap');
      
      // Mock loadScript返回失败的Promise
      (loadScript as any).mockRejectedValue(new Error('加载失败'));
      (loadCSS as any).mockResolvedValue(undefined);
      
      // 调用loadBMapGLLib
      await expect(loadBMapGLLib()).rejects.toThrow('加载失败');
    });
  });
});