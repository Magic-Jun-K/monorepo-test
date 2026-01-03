import { useEffect, useState } from 'react';

import { request } from '@/utils/httpClient';
import { currentUser } from '@/services/auth';
import { useAuthStore } from '@/stores/zustand/auth.store';
import { useUserStore } from '@/stores/zustand/user.store';

// Define response type for better type safety
interface AuthResponse {
  success: boolean;
  data?: string; // Adjust based on actual token type
}

export function useAuthCheck() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Step 1: Attempt token refresh
        const authResponse = await request.post<AuthResponse>('/auth/refresh');
        if (authResponse.success && authResponse.data) {
          // console.log('checkAuth ✅ 刷新token成功');
          useAuthStore.getState().setToken(authResponse.data);
        }

        // Step 2: Verify authentication status and get user info
        const userResponse = await currentUser();
        if (userResponse.data) {
          useUserStore.getState().setCurrentUser(userResponse.data);
          console.log('Auth check: 用户信息已更新:', userResponse.data);
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.log('认证检查失败:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return { loading, isAuthenticated };
}
