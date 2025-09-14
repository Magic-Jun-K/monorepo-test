import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { loadScript } from './loadScript';

describe('loadScript', () => {
  const scriptSrc = 'https://example.com/test.js';

  beforeEach(() => {
    // 清理DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // 清理所有mock
    vi.clearAllMocks();
  });

  it('应该成功加载新的脚本', async () => {
    // Mock HTMLHeadElement.appendChild
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');
    
    // Mock script element events
    const mockScript = document.createElement('script');
    
    // Mock document.createElement
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'script') {
        return mockScript;
      }
      return document.createElement(tagName);
    });
    
    // 调用loadScript
    const loadPromise = loadScript(scriptSrc);
    
    // 验证createElement被调用
    expect(createElementSpy).toHaveBeenCalledWith('script');
    
    // 验证script属性设置
    expect(mockScript.type).toBe('text/javascript');
    expect(mockScript.src).toBe(scriptSrc);
    expect(mockScript.async).toBe(true);
    
    // 验证appendChild被调用
    expect(appendChildSpy).toHaveBeenCalledWith(mockScript);
    
    // 模拟脚本加载完成
    mockScript.onload!(new Event('load'));
    
    // 等待promise解决
    await expect(loadPromise).resolves.toBeUndefined();
  });

  it('应该在脚本加载失败时拒绝Promise', async () => {
    // Mock script element events
    const mockScript = document.createElement('script');
    
    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'script') {
        return mockScript;
      }
      return document.createElement(tagName);
    });
    
    // Mock appendChild
    vi.spyOn(document.head, 'appendChild').mockImplementation((element) => {
      return element as any;
    });
    
    // 调用loadScript
    const loadPromise = loadScript(scriptSrc);
    
    // 模拟脚本加载失败，创建一个带有消息的错误对象
    mockScript.onerror!(new ErrorEvent('error', { message: '加载失败' }));
    
    // 等待promise拒绝
    await expect(loadPromise).rejects.toThrow('加载失败');
  });

  it('应该在脚本已存在时直接resolve', async () => {
    // 使用innerHTML方式创建一个已存在的脚本元素
    document.head.innerHTML = `<script src="${scriptSrc}"></script>`;
    
    // 调用loadScript
    const loadPromise = loadScript(scriptSrc);
    
    // 应该立即resolve
    await expect(loadPromise).resolves.toBeUndefined();
  });
});