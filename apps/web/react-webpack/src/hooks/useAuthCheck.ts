import { useEffect, useRef, useState } from 'react';

import { request } from '@/utils/httpClient';
import { currentUser } from '@/services/auth';
import { useAuthStore } from '@/stores/zustand/auth.store';
import { useUserStore } from '@/stores/zustand/user.store';

// Define response type for better type safety(定义响应类型以提高类型安全性)
interface AuthResponse {
  success: boolean;
  data?: string; // Adjust based on actual token type(根据实际的标记类型进行调整)
}

export function useAuthCheck() {
  // Subscribe to store updates to handle async hydration(订阅状态更新以处理异步加载操作)
  const token = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const tokenRef = useRef(token); // 使用 ref 保持最新的 token 值，但不触发重渲染或作为依赖

  // 总是保持 ref 是最新的
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // 优化：使用同步的 Cookie 标记 (auth_marker) 进行乐观 UI 渲染
  // Cookie 是同步可读的，可以完美解决 IndexedDB 异步导致的"验证身份"闪烁问题
  // 注意：这个 Cookie 不包含任何 Token，仅是一个 boolean 标记，安全性由后台的 HttpOnly Cookie 保证
  const hasAuthMarker =
    typeof document !== 'undefined' && document.cookie.includes('auth_marker=1');

  const [loading, setLoading] = useState(!hasAuthMarker);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    hasAuthMarker ? true : null,
  );

  useEffect(() => {
    // 即使是乐观渲染，我们也需要等待 Hydrated 来确保能获取到 Token (或者确认没有 Token)
    if (!isHydrated) return;

    const checkAuth = async () => {
      try {
        // 情况1: 本地存储有 Token -> 认证成功
        if (tokenRef.current) {
          setIsAuthenticated(true);
          setLoading(false);

          // 确保标记存在 (防止被误删)
          if (!document.cookie.includes('auth_marker=1')) {
            document.cookie = 'auth_marker=1; path=/; max-age=604800; SameSite=Strict';
          }

          // 静默更新用户信息
          try {
            const userResponse = await currentUser();
            if (userResponse.data) {
              useUserStore.getState().setCurrentUser(userResponse.data);
            }
          } catch (e) {
            console.error('Silent user update failed', e);
          }
          return;
        }

        // 情况2: 没有 Token，尝试通过 Refresh Token 获取
        const authResponse = await request.post<AuthResponse>('/auth/refresh');
        if (authResponse.success && authResponse.data) {
          useAuthStore.getState().setToken(authResponse.data);
          setIsAuthenticated(true);
        } else {
          // 刷新失败，确认未认证
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isHydrated]);

  return { loading, isAuthenticated };
}
