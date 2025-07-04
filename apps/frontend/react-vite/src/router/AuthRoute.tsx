import { FC } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthCheck } from '@/hooks/useAuthCheck';

interface AuthRouteProps {
  children: JSX.Element;
  roles?: string[];
}

const AuthRoute: FC<AuthRouteProps> = ({ children }) => {
  const { loading, isAuthenticated } = useAuthCheck();
  console.log('测试AuthRoute isAuthenticated', isAuthenticated);

  if (loading) {
    return <div>正在验证登录状态...</div>;
    // return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/account/login?redirect=${window.location.pathname}`} />;
  }

  // 如果用户已登录，渲染子组件
  return children;
};
export default AuthRoute;
