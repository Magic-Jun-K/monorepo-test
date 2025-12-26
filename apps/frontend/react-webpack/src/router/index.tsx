import { createBrowserRouter } from 'react-router-dom';

import Layout from '../layout';
import AuthRoute from './AuthRoute';

import Login from '../pages/Login';

import { useUserStore } from '@/store/zustand/user.store';
import { getRoutesFromMenu } from '../layout/Menu/constant';

export const loadComponent = (path: string) => {
  return () =>
    import(`../pages/${path}/index`).then((module) => ({
      Component: module.default,
    }));
};

// 从菜单配置生成路由（同步版本 - 用于初始渲染）
const generateRoutesFromMenu = () => {
  // 从userStore获取用户信息，如果没有则默认使用管理员权限生成所有路由
  // 这样可以确保所有路由都存在，权限控制由AuthRoute组件处理
  const cachedUser = useUserStore.getState().getCurrentUser();
  const currentUserType = cachedUser
    ? useUserStore.getState().getIsAdmin()
      ? 'admin'
      : 'user'
    : 'admin';
  console.log('当前用户类型:', currentUserType);
  console.log('是否是管理员:', useUserStore.getState().getIsAdmin());
  console.log('缓存的用户信息:', cachedUser);

  const menuRoutes = getRoutesFromMenu(currentUserType);
  console.log('从菜单配置生成的路由:', menuRoutes);

  const routes = menuRoutes.map((route) => {
    // console.log('处理路由项:', route);

    // 处理根路径特殊情况
    if (route.path === '/') {
      // 检测到根路径，设置为 index: true
      return {
        index: true,
        lazy: loadComponent(route.component),
      };
    }

    const finalPath = route.path.replace(/^\//, ''); // 移除开头的斜杠
    // console.log(`最终路径: "${finalPath}"`);

    return {
      path: finalPath,
      lazy: loadComponent(route.component),
    };
  });

  return routes;
};

// 路由映射表
const routes = [
  {
    path: '/',
    element: (
      <AuthRoute>
        <Layout />
      </AuthRoute>
    ),
    children: generateRoutesFromMenu(),
  },
  {
    path: '/account/login',
    element: <Login />,
  },
];
// console.log('完整路由配置:', JSON.stringify(routes, null, 2));

export const router = createBrowserRouter(routes);
