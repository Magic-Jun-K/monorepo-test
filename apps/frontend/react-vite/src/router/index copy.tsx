import { createBrowserRouter } from 'react-router-dom';

import AuthRoute from './AuthRoute';
import Layout from '@/layout';
import Login from '@/pages/Login';
// import ErrorPage from '@/components/ErrorPage';
import CacheExample from '@/pages/Test/CacheExample';
import MicroservicesTest from '@/pages/Test/MicroservicesTest';

export const loadComponent = (path: string) => {
  return () =>
    import(/* @vite-ignore */ `../pages/${path}`).then(module => ({
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
    // errorElement: <ErrorPage />, // 全局错误捕获
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
        path: 'table-test',
        lazy: loadComponent('TableTest')
      },
      {
        path: '/baidu-map',
        lazy: loadComponent('BMapGLCom')
      },
      {
        path: '/cache-test',
        element: <CacheExample />
      },
      {
        path: '/microservices-test',
        element: <MicroservicesTest />
      }
    ]
  },
  {
    path: '/account/login',
    element: <Login />
  }
]);
