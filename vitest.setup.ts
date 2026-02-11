// Vitest Setup
import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// 配置全局模拟
beforeAll(() => {
  // 配置 ResizeObserver
  global.ResizeObserver =
    global.ResizeObserver ||
    class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      private callback: ResizeObserverCallback;
    };

  // 配置 IntersectionObserver
  global.IntersectionObserver =
    global.IntersectionObserver ||
    class IntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      private callback: IntersectionObserverCallback;
    };

  // 配置 URL.createObjectURL
  Object.defineProperty(global.URL, 'createObjectURL', {
    writable: true,
    value: vi.fn(() => 'mocked-object-url'),
  });

  // 配置 URL.revokeObjectURL
  Object.defineProperty(global.URL, 'revokeObjectURL', {
    writable: true,
    value: vi.fn(),
  });

  // 配置 window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // 配置 localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // 配置 sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  // 配置 fetch mock
  global.fetch = vi.fn();

  // 配置 console 行为
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') || args[0].includes('componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

// 每个测试后清理
afterEach(() => {
  vi.clearAllMocks();

  // 清理 localStorage 和 sessionStorage
  if (window.localStorage) {
    window.localStorage.clear();
  }
  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }
});

afterAll(() => {
  vi.restoreAllMocks();
});
