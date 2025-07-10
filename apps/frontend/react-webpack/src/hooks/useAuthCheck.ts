import { useEffect, useState } from 'react';

import { request } from '@/utils/httpClient';
import { authStore } from '@/store/auth.store';

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
          authStore.setToken(authResponse.data);
        }

        // Step 2: Verify authentication status
        // await request.get('/auth/current-user');
        setIsAuthenticated(true);
      } catch {
        // console.log('测试checkAuth catch');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return { loading, isAuthenticated };
}
