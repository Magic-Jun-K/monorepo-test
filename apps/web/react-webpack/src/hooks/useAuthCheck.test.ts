import { describe, beforeEach, it, expect, afterAll, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import { request } from '@/utils/httpClient';
import { useAuthCheck } from './useAuthCheck';

// Mock 外部依赖
vi.mock('@/utils/httpClient', () => ({
  request: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

vi.mock('@/store/zustand/auth.store', () => ({
  useAuthStore: {
    setToken: vi.fn(),
    getState: vi.fn(() => ({
      setToken: vi.fn(),
      clear: vi.fn()
    }))
  }
}));

describe('useAuthCheck', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    vi.clearAllMocks();
    // 保存原始 localStorage 并创建模拟版本
    originalLocalStorage = globalThis.localStorage;
    globalThis.localStorage = {
      clear: vi.fn(),
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn()
    };
  });

  afterAll(() => {
    // 恢复原始 localStorage
    globalThis.localStorage = originalLocalStorage;
  });

  it('should return loading true initially', () => {
    const { result } = renderHook(() => useAuthCheck());

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(null);
  });

  it('should set isAuthenticated to true when auth check succeeds', async () => {
    // Mock 成功的认证响应
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: 'mock-token'
    });

    const { result } = renderHook(() => useAuthCheck());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(request.post).toHaveBeenCalledWith('/auth/refresh');
  });

  it('should set isAuthenticated to false when auth check fails', async () => {
    // Mock 失败的认证响应
    (request.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(() => useAuthCheck());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle successful refresh but no token in response', async () => {
    // Mock 成功但无 token 的响应
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: null
    });

    const { result } = renderHook(() => useAuthCheck());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle unsuccessful refresh response', async () => {
    // Mock 不成功的响应
    (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      data: null
    });

    const { result } = renderHook(() => useAuthCheck());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
