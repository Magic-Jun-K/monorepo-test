import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia for Antd components
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

// Mock getComputedStyle for Antd
global.getComputedStyle = vi.fn().mockImplementation(() => ({
  getPropertyValue: vi.fn()
}));

// Mock window.requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(callback => {
  return setTimeout(callback, 0);
});

global.cancelAnimationFrame = vi.fn().mockImplementation(id => {
  clearTimeout(id);
});

// 全局处理未捕获的 Promise 拒绝，忽略 Ant Design 表单验证错误
process.on('unhandledRejection', reason => {
  // 忽略 Ant Design 表单验证错误
  if (reason && typeof reason === 'object' && 'errorFields' in reason) {
    // 这是预期的表单验证错误，忽略它
    return;
  }
  // 对于其他未处理的拒绝，仍然抛出错误
  throw reason;
});
