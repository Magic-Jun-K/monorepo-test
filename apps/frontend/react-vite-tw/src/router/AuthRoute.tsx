import { FC, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import { authStore } from '@/store/auth.store';

interface AuthRouteProps {
  children: JSX.Element;
  roles?: string[];
}

const AuthRoute: FC<AuthRouteProps> = ({ children }) => {
  // 添加一个ref来跟踪刷新状态，避免状态更新时序问题
  const refreshingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true); // 默认为加载中状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      // 重置状态
      setIsLoading(true);

      // 如果已经有 access_token，直接认为已认证
      if (authStore.getAccessToken()) {
        console.log('已有 access_token，直接认证通过');
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // 如果没有 access_token 但有 refresh_token，尝试刷新
      const refreshToken = authStore.getRefreshToken() || localStorage.getItem('refresh_token');

      if (refreshToken && !refreshingRef.current) {
        refreshingRef.current = true; // 标记正在刷新
        try {
          console.log('尝试使用 refresh_token 获取新的 access_token');
          const response = await axios.post('/api/auth/refresh', {
            refresh_token: refreshToken
          });

          if (response.data && response.data.success) {
            // 保存新的 token
            const { access_token, refresh_token } = response.data.data;
            const rememberMe = !!localStorage.getItem('refresh_token');
            authStore.setTokens(access_token, refresh_token, rememberMe);

            console.log('🔄 Token 已成功刷新！', new Date().toLocaleTimeString());

            // 确保状态更新
            setIsAuthenticated(true);
            setIsLoading(false);
            return; // 提前返回，避免执行后续代码
          } else {
            console.error('刷新 token 失败:', response.data);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('刷新 token 出错:', error);
          setIsAuthenticated(false);
        } finally {
          refreshingRef.current = false; // 重置刷新标记
          setIsLoading(false);
        }
      } else {
        if (refreshingRef.current) {
          console.log('Token 刷新已在进行中，请等待...');
        } else {
          console.log('没有 refresh_token，需要重新登录');
        }
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    // 立即执行检查
    checkAndRefreshToken();
  }, [location.pathname]);

  // 加载中显示
  if (isLoading) {
    return <div>正在验证身份...</div>;
  }

  // 再次检查 access_token，确保使用最新状态
  const hasToken = !!authStore.getAccessToken();

  // 如果用户没有登录，重定向到登录页面
  // if (!authStore.getAccessToken()) {
  if (!isAuthenticated && !hasToken) {
    console.log('未认证，重定向到登录页');
    return <Navigate to={`/account/login?redirect=${window.location.pathname}`} />;
  }

  // 如果用户已登录，渲染子组件
  console.log('认证通过，渲染受保护内容');
  return children;
};
export default AuthRoute;
