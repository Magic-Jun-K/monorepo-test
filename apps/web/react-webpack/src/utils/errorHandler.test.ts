import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

import { setupErrorHandlers } from './errorHandler';

describe('errorHandler', () => {
  let originalAddEventListener: typeof window.addEventListener;
  let originalRemoveEventListener: typeof window.removeEventListener;
  let mockErrorListener: ((event: ErrorEvent) => void) | null = null;
  let mockRejectionListener: ((event: PromiseRejectionEvent) => void) | null = null;

  beforeEach(() => {
    // 保存原始的事件监听器方法
    originalAddEventListener = window.addEventListener;
    originalRemoveEventListener = window.removeEventListener;
    
    // 模拟 addEventListener 来捕获监听器
    window.addEventListener = vi.fn((type: string, listener: EventListener) => {
      if (type === 'error') {
        mockErrorListener = listener as ((event: ErrorEvent) => void) | null;
      } else if (type === 'unhandledrejection') {
        mockRejectionListener = listener as ((event: PromiseRejectionEvent) => void) | null;
      }
    }) as typeof window.addEventListener;
  });

  afterEach(() => {
    // 恢复原始的事件监听器方法
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
    // 清理
    mockErrorListener = null;
    mockRejectionListener = null;
    vi.restoreAllMocks();
  });

  describe('setupErrorHandlers', () => {
    it('should set up global error listener', () => {
      setupErrorHandlers();

      expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should set up unhandled promise rejection listener', () => {
      setupErrorHandlers();

      expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });

    it('should handle global errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      setupErrorHandlers();

      if (mockErrorListener) {
        const mockEvent = {
          message: 'Test error',
          filename: 'test.js',
          lineno: 1,
          colno: 1,
          error: new Error('Test'),
          preventDefault: vi.fn()
        };

        mockErrorListener(mockEvent as unknown as ErrorEvent);

        expect(consoleSpy).toHaveBeenCalledWith('全局错误拦截:', {
          message: 'Test error',
          source: 'test.js',
          lineno: 1,
          colno: 1,
          error: new Error('Test')
        });
        expect(mockEvent.preventDefault).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    it('should handle unhandled promise rejections', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      setupErrorHandlers();

      if (mockRejectionListener) {
        const mockEvent = {
          reason: 'Promise rejection reason',
          preventDefault: vi.fn()
        };

        mockRejectionListener(mockEvent as unknown as PromiseRejectionEvent);

        expect(consoleSpy).toHaveBeenCalledWith('未处理的 Promise 异常:', 'Promise rejection reason');
        expect(mockEvent.preventDefault).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });
  });
});
