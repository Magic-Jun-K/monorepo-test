import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock virtual modules
vi.mock('virtual:uno.css', () => ({}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock Worker
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  
  postMessage() {
    // 模拟Worker消息处理
  }
  
  terminate() {}
}

global.Worker = MockWorker as unknown as typeof Worker;

// Mock BMapGL and mapvgl globals
global.window = global.window || ({} as Window & typeof globalThis & { BMapGL: unknown; mapvgl: unknown });

const mockBMapGL = {
  Map: vi.fn().mockImplementation(() => ({
    centerAndZoom: vi.fn(),
    enableScrollWheelZoom: vi.fn(),
    addControl: vi.fn(),
    getBounds: vi.fn().mockReturnValue({
      getSouthWest: vi.fn().mockReturnValue({ lng: 113.2, lat: 23 }),
      getNorthEast: vi.fn().mockReturnValue({ lng: 113.5, lat: 23.2 })
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    panTo: vi.fn(),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(14),
    destroy: vi.fn()
  })),
  Point: vi.fn(),
  Bounds: vi.fn(),
  ScaleControl: vi.fn()
};

Reflect.set(global.window, 'BMapGL', mockBMapGL);

const mockMapvgl = {
  View: vi.fn().mockImplementation(() => ({
    addLayer: vi.fn(),
    destroy: vi.fn()
  })),
  IconClusterLayer: vi.fn().mockImplementation(() => ({
    setData: vi.fn(),
    destroy: vi.fn()
  }))
};

Reflect.set(global.window, 'mapvgl', mockMapvgl);

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  })
) as unknown as typeof fetch;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-blob-url');
global.URL.revokeObjectURL = vi.fn();

// 添加对 unocss-ui 中其他可能的虚拟模块的模拟
vi.mock('@eggshell/unocss-ui', async () => {
  const actual = await vi.importActual('@eggshell/unocss-ui');
  return {
    ...actual,
    // 如果需要，可以在这里添加对特定导出的模拟
  };
});