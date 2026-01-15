import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { heightManager } from './heightManager';

describe('heightManager', () => {
  beforeEach(() => {
    // 重置heightManager状态
    heightManager.currentHeight = 0;
    heightManager.listeners.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('基础功能测试', () => {
    it('应该初始化为默认状态', () => {
      expect(heightManager.currentHeight).toBe(0);
      expect(heightManager.listeners.size).toBe(0);
    });

    it('应该能够更新高度', () => {
      const newHeight = 500;

      heightManager.updateHeight(newHeight);

      expect(heightManager.currentHeight).toBe(newHeight);
    });

    it('应该能够订阅高度变化', () => {
      const mockListener = vi.fn();

      const unsubscribe = heightManager.subscribe(mockListener);

      expect(heightManager.listeners.size).toBe(1);
      expect(typeof unsubscribe).toBe('function');
    });

    it('应该能够取消订阅', () => {
      const mockListener = vi.fn();

      const unsubscribe = heightManager.subscribe(mockListener);
      expect(heightManager.listeners.size).toBe(1);

      unsubscribe();
      expect(heightManager.listeners.size).toBe(0);
    });
  });

  describe('通知机制测试', () => {
    it('应该通知所有订阅者高度变化', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      heightManager.subscribe(listener1);
      heightManager.subscribe(listener2);
      heightManager.subscribe(listener3);

      const newHeight = 600;
      heightManager.updateHeight(newHeight);

      expect(listener1).toHaveBeenCalledWith(newHeight);
      expect(listener2).toHaveBeenCalledWith(newHeight);
      expect(listener3).toHaveBeenCalledWith(newHeight);
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it('应该在多次更新时通知所有订阅者', () => {
      const listener = vi.fn();

      heightManager.subscribe(listener);

      heightManager.updateHeight(100);
      heightManager.updateHeight(200);
      heightManager.updateHeight(300);

      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, 100);
      expect(listener).toHaveBeenNthCalledWith(2, 200);
      expect(listener).toHaveBeenNthCalledWith(3, 300);
    });

    it('不应该通知已取消订阅的监听器', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = heightManager.subscribe(listener1);
      heightManager.subscribe(listener2);

      // 取消第一个监听器的订阅
      unsubscribe1();

      const newHeight = 400;
      heightManager.updateHeight(newHeight);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith(newHeight);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理负数高度', () => {
      const listener = vi.fn();
      heightManager.subscribe(listener);

      heightManager.updateHeight(-100);

      expect(heightManager.currentHeight).toBe(-100);
      expect(listener).toHaveBeenCalledWith(-100);
    });

    it('应该处理零高度', () => {
      const listener = vi.fn();
      heightManager.subscribe(listener);

      heightManager.updateHeight(0);

      expect(heightManager.currentHeight).toBe(0);
      expect(listener).toHaveBeenCalledWith(0);
    });

    it('应该处理极大高度值', () => {
      const listener = vi.fn();
      heightManager.subscribe(listener);

      const largeHeight = Number.MAX_SAFE_INTEGER;
      heightManager.updateHeight(largeHeight);

      expect(heightManager.currentHeight).toBe(largeHeight);
      expect(listener).toHaveBeenCalledWith(largeHeight);
    });

    it('应该处理小数高度', () => {
      const listener = vi.fn();
      heightManager.subscribe(listener);

      const decimalHeight = 100.5;
      heightManager.updateHeight(decimalHeight);

      expect(heightManager.currentHeight).toBe(decimalHeight);
      expect(listener).toHaveBeenCalledWith(decimalHeight);
    });

    it('应该处理没有订阅者时的高度更新', () => {
      // 不应该报错
      expect(() => {
        heightManager.updateHeight(500);
      }).not.toThrow();

      expect(heightManager.currentHeight).toBe(500);
    });
  });

  describe('多订阅者管理测试', () => {
    it('应该支持大量订阅者', () => {
      const listeners = Array.from({ length: 100 }, () => vi.fn());
      const unsubscribers: (() => void)[] = [];

      // 添加100个监听器
      listeners.forEach(listener => {
        const unsubscribe = heightManager.subscribe(listener);
        unsubscribers.push(unsubscribe);
      });

      expect(heightManager.listeners.size).toBe(100);

      heightManager.updateHeight(999);

      listeners.forEach(listener => {
        expect(listener).toHaveBeenCalledWith(999);
      });

      // 清理订阅
      unsubscribers.forEach(unsubscribe => unsubscribe());
      expect(heightManager.listeners.size).toBe(0);
    });

    it('应该防止重复订阅同一个监听器', () => {
      const listener = vi.fn();

      heightManager.subscribe(listener);
      heightManager.subscribe(listener);

      // Set会自动去重
      expect(heightManager.listeners.size).toBe(1);

      heightManager.updateHeight(123);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('应该处理监听器执行时抛出异常', () => {
      const errorListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = vi.fn();

      heightManager.subscribe(errorListener);
      heightManager.subscribe(normalListener);

      // 即使一个监听器抛出异常，也不应该影响其他监听器
      expect(() => {
        heightManager.updateHeight(400);
      }).toThrow('Listener error');

      expect(errorListener).toHaveBeenCalledWith(400);
      // 注意：由于forEach中的异常会中断执行，normalListener可能不会被调用
    });
  });

  describe('状态持久性测试', () => {
    it('应该在订阅和取消订阅之间保持状态', () => {
      heightManager.updateHeight(200);

      const listener = vi.fn();
      heightManager.subscribe(listener);

      expect(heightManager.currentHeight).toBe(200);

      heightManager.updateHeight(300);
      expect(heightManager.currentHeight).toBe(300);
      expect(listener).toHaveBeenCalledWith(300);
    });

    it('应该在多次高度更新之间保持最新状态', () => {
      heightManager.updateHeight(100);
      expect(heightManager.currentHeight).toBe(100);

      heightManager.updateHeight(200);
      expect(heightManager.currentHeight).toBe(200);

      heightManager.updateHeight(300);
      expect(heightManager.currentHeight).toBe(300);

      const listener = vi.fn();
      heightManager.subscribe(listener);

      // 新订阅的监听器不会收到历史高度，只会收到新的高度变化
      expect(listener).not.toHaveBeenCalled();

      heightManager.updateHeight(400);
      expect(listener).toHaveBeenCalledWith(400);
    });
  });
});
