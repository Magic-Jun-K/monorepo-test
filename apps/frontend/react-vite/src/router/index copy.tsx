import { createBrowserRouter } from 'react-router-dom';

import Layout from '../layout';
import AuthRoute from './AuthRoute';
import Login from '../pages/Login';

export const loadComponent = (path: string) => {
  return () => import(/* @vite-ignore */ `../pages/${path}`).then(module => ({
    Component: module.default
  }));
};

// 路由映射表
export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthRoute>
        <Layout />
      </AuthRoute>
    ),
    children: [
      {
        index: true, // 当访问根路径时，默认渲染 Home 组件
        // lazy: () => import('../pages/Home').then(module => ({
        //   Component: module.default // 关键区别：返回 Component 而非 element
        // }))
        lazy: loadComponent('Home')
      },
      {
        path: 'form-test',
        lazy: loadComponent('FormTest')
      },
      {
        path: '/baidu-map',
        lazy: () => import('../pages/BMapGLCom').then(module => ({
          Component: module.default // 关键区别：返回 Component 而非 element
        }))
        // lazy: loadComponent('BMapGLCom')
      }
    ]
  },
  {
    path: '/account/login',
    element: <Login />
  }
]);
