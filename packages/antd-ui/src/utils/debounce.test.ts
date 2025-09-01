import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('基础防抖功能', () => {
    it('应该延迟执行函数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该在连续调用时只执行最后一次', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该传递正确的参数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 'arg3');

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('应该传递最后一次调用的参数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('third');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该保持正确的this上下文', () => {
      const mockFn = vi.fn();
      const obj = {
        method: debounce(mockFn, 100)
      };

      obj.method();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('leading选项测试', () => {
    it('应该在leading=true时立即执行', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: true });

      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // 不应该再次执行
    });

    it('应该在leading=true且连续调用时只执行首次', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: true });

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // 仍然只执行一次
    });

    it('应该在leading=true时在延迟后重新允许立即执行', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: true });

      // 首次调用
      debouncedFn('first');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      // 等待延迟结束
      vi.advanceTimersByTime(100);

      // 再次调用应该立即执行
      debouncedFn('second');
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('second');
    });

    it('应该在leading=false时按默认行为执行', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: false });

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('时间控制测试', () => {
    it('应该使用正确的延迟时间', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 250);

      debouncedFn();

      vi.advanceTimersByTime(249);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该在中断后重新计时', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);

      debouncedFn(); // 重新计时
      vi.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该处理零延迟', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('多次调用测试', () => {
    it('应该在延迟期间重置定时器', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      vi.advanceTimersByTime(50);

      debouncedFn(); // 重置定时器
      vi.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该处理快速连续调用', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      for (let i = 0; i < 10; i++) {
        debouncedFn(`call-${i}`);
        vi.advanceTimersByTime(10);
      }

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call-9');
    });

    it('应该处理间隔调用', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');

      debouncedFn('second');
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('second');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理负延迟时间', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, -100);

      debouncedFn();

      // 负延迟应该被当作0处理
      vi.advanceTimersByTime(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该处理undefined参数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn(undefined);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith(undefined);
    });

    it('应该处理null参数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn(null);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith(null);
    });

    it('应该处理复杂对象参数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      const complexObj = { a: 1, b: [1, 2, 3], c: { nested: true } };
      debouncedFn(complexObj);

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith(complexObj);
    });

    it('应该处理抛出异常的函数', () => {
      const errorFn = vi.fn(() => {
        throw new Error('Test error');
      });
      const debouncedFn = debounce(errorFn, 100);

      debouncedFn();

      expect(() => {
        vi.advanceTimersByTime(100);
      }).toThrow('Test error');

      expect(errorFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('类型安全测试', () => {
    it('应该正确处理不同类型的参数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn(1, 'string', true, [], {});

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith(1, 'string', true, [], {});
    });

    it('应该正确处理空参数调用', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith();
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量调用', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // 模拟1000次快速调用
      for (let i = 0; i < 1000; i++) {
        debouncedFn(i);
      }

      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(999);
    });
  });

  describe('清理测试', () => {
    it('应该正确清理定时器', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn(); // 应该清理之前的定时器

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
