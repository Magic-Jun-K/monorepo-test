import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// 每个测试后清理
afterEach(() => {
  cleanup();
});

// 模拟 CSS 模块
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  })
});

// 声明全局类型以避免 TypeScript 错误
declare const global: {
  IntersectionObserver: typeof IntersectionObserver;
  ResizeObserver: typeof ResizeObserver;
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
};

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];
  scrollMargin: string = '0px';

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    void callback; // 明确标记参数被有意忽略
    void options; // 明确标记参数被有意忽略
  }

  disconnect() {}
  observe(target: Element) { void target; }
  unobserve(target: Element) { void target; }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  // 移除空的构造函数
  disconnect() {}
  observe() {}
  unobserve() {}
};

// 模拟 requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(callback, 16) as unknown as number;
};

global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};
