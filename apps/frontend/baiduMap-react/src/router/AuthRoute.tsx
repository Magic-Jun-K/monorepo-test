import { FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { RootState } from '@/store/store';

interface AuthRouteProps {
  children: JSX.Element;
  roles?: string[];
}

const AuthRoute: FC<AuthRouteProps> = ({ children }) => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  console.log('AuthRoute user', user);
  console.log('AuthRoute token', token);

  // if (!token) {
  //   // replace 表示替换当前路由，不会在浏览器历史记录中留下当前路由
  //   return <Navigate to="/login" replace />;
  // }

  // 如果用户没有登录，重定向到登录页面
  if (!localStorage.getItem('token')) {
    return <Navigate to={`/account/login?redirect=${window.location.pathname}`} />;
    // return <Navigate to={`/login?redirect=${window.location.pathname}`} />;
  }

  // if (roles && user?.roles.some(role => !roles.includes(role))) {
  //   return <Navigate to="/403" replace />;
  // }

  // 如果用户已登录，渲染子组件
  return children;
};
export default AuthRoute;
