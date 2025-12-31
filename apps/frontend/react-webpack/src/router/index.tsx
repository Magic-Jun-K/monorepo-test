import { createBrowserRouter } from 'react-router-dom';

import Layout from '../layout';
import AuthRoute from './AuthRoute';

import Login from '../pages/Login';

import { useUserStore } from '@/stores/zustand/user.store';
import { getRoutesFromMenu } from '../layout/Menu/constant';

export const loadComponent = (path: string) => {
  return () =>
    import(`../pages/${path}/index`).then((module) => ({
      Component: module.default,
    }));
};

// 从菜单配置生成路由（同步版本 - 用于初始渲染）
const generateRoutesFromMenu = () => {
  const userStore = useUserStore.getState();
  const cachedUser = userStore.getCurrentUser(); // 缓存用户信息
  const isAdmin = cachedUser ? userStore.getIsAdmin() : true;
  // console.log('是否是管理员:', isAdmin);
  // console.log('缓存的用户信息:', cachedUser);

  const menuRoutes = getRoutesFromMenu(isAdmin);
  // console.log('从菜单配置生成的路由:', menuRoutes);

  const routes = menuRoutes.map((route) => {
    // 处理根路径特殊情况
    if (route.path === '/') {
      // 检测到根路径，设置为 index: true
      return {
        index: true,
        lazy: loadComponent(route.component),
      };
    }

    const finalPath = route.path.replace(/^\//, ''); // 移除开头的斜杠

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

export const router = createBrowserRouter(routes);
