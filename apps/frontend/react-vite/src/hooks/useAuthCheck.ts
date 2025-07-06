import { useEffect, useState } from 'react';
import { request } from '@/utils/httpClient';

export function useAuthCheck() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Step 1: Attempt token refresh
        await request.post('/auth/refresh');

        // Step 2: Verify authentication status
        await request.get('/auth/current-user');
        setIsAuthenticated(true);
      } catch {
        console.log('测试checkAuth catch');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return { loading, isAuthenticated };
}
