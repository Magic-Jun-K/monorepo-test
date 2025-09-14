import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { loadCSS } from './loadCSS';

describe('loadCSS', () => {
  const cssHref = 'https://example.com/test.css';

  beforeEach(() => {
    // 清理DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // 清理所有mock
    vi.clearAllMocks();
  });

  it('应该成功加载新的CSS样式', async () => {
    // Mock HTMLHeadElement.appendChild
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');
    
    // Mock link element events
    const mockLink = document.createElement('link');
    
    // Mock document.createElement
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'link') {
        return mockLink;
      }
      return document.createElement(tagName);
    });
    
    // 调用loadCSS
    const loadPromise = loadCSS(cssHref);
    
    // 验证createElement被调用
    expect(createElementSpy).toHaveBeenCalledWith('link');
    
    // 验证link属性设置
    expect(mockLink.href).toBe(cssHref);
    expect(mockLink.rel).toBe('stylesheet');
    
    // 验证appendChild被调用
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
    
    // 模拟样式加载完成
    mockLink.onload!(new Event('load'));
    
    // 等待promise解决
    await expect(loadPromise).resolves.toBeUndefined();
  });

  it('应该在样式加载失败时拒绝Promise', async () => {
    // Mock link element events
    const mockLink = document.createElement('link');
    
    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'link') {
        return mockLink;
      }
      return document.createElement(tagName);
    });
    
    // Mock appendChild
    vi.spyOn(document.head, 'appendChild').mockImplementation((element) => {
      return element as any;
    });
    
    // 调用loadCSS
    const loadPromise = loadCSS(cssHref);
    
    // 模拟样式加载失败，创建一个带有消息的错误对象
    mockLink.onerror!(new ErrorEvent('error', { message: '加载失败' }));
    
    // 等待promise拒绝
    await expect(loadPromise).rejects.toThrow('加载失败');
  });

  it('应该在样式已存在时直接resolve', async () => {
    // 使用innerHTML方式创建一个已存在的link元素
    document.head.innerHTML = `<link href="${cssHref}" rel="stylesheet" />`;
    
    // 调用loadCSS
    const loadPromise = loadCSS(cssHref);
    
    // 应该立即resolve
    await expect(loadPromise).resolves.toBeUndefined();
  });
});