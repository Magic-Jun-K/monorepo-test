import '@testing-library/jest-dom';
import { vi } from 'vitest';

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock getComputedStyle for Antd
globalThis.getComputedStyle = vi.fn().mockImplementation(() => ({
  getPropertyValue: vi.fn(),
}));

globalThis.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
  return globalThis.setTimeout(callback, 0);
});

globalThis.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
  globalThis.clearTimeout(id);
});

globalThis.process = globalThis.process || {
  on: vi.fn(),
};

globalThis.process.on('unhandledRejection', (reason) => {
  if (reason && typeof reason === 'object' && 'errorFields' in reason) {
    return;
  }
  throw reason;
});
