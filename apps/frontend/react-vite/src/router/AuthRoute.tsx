import { FC } from 'react';
import { Navigate } from 'react-router-dom';

// import { authStore } from '@/store/auth.store';
import { useAuthCheck } from '@/hooks/useAuthCheck';

interface AuthRouteProps {
  children: JSX.Element;
  roles?: string[];
}

const AuthRoute: FC<AuthRouteProps> = ({ children }) => {
  // 如果用户没有登录，重定向到登录页面
  // if (!authStore.getAccessToken()) {
  //   return <Navigate to={`/account/login?redirect=${window.location.pathname}`} />;
  // }
  const { loading, isAuthenticated } = useAuthCheck();

  if (loading) {
    // 可自定义 loading UI
    return <div>正在验证登录状态...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/account/login?redirect=${window.location.pathname}`} />;
  }

  // 如果用户已登录，渲染子组件
  return children;
};
export default AuthRoute;
