import { createBrowserRouter } from 'react-router-dom';

import Login from '../pages/Login';
import Layout from '../layout';
import AuthRoute from './AuthRoute';
import Home from '@/pages/Home';

type PickRouter<T> = T extends (...args: any[]) => infer R ? R : never;
type A = typeof createBrowserRouter;

// 这里是为了解决 react-router-dom 的类型问题
export const loadComponent = (path: string) => {
  return async () => {
    const module = await import(/* @vite-ignore */ `../pages/${path}`);
    return { element: <module.default /> };
  };
};

// 路由映射表
export const router: PickRouter<A> = createBrowserRouter([
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
        // lazy: async () => {
        //   const data = await import('../pages/Home');
        //   const Home = data.default;
        //   return {
        //     element: <Home />
        //   };
        // }
        // lazy: loadComponent('Home')
        element: <Home />
      },
      {
        path: 'form-test',
        lazy: loadComponent('FormTest')
      },
      {
        path: '/baidu-map',
        lazy: loadComponent('BMapGLCom')
      }
    ]
  },
  {
    path: '/account/login',
    element: <Login />
  }
]);
