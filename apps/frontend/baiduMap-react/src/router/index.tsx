import { createBrowserRouter } from 'react-router-dom';

import Login from '../pages/Login';
import Layout from '../layout';
import AuthRoute from './AuthRoute';

// 这里是为了解决 react-router-dom 的类型问题
 
type PickRouter<T> = T extends (...args: any[]) => infer R ? R : never;

type A = typeof createBrowserRouter;

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
        lazy: async () => {
          const data = await import('../pages/Home');
          const Home = data.default;
          return {
            element: <Home />
          };
        }
        // lazy: loadComponent('Home')
      },
      {
        path: 'form-test',
        lazy: async () => {
          const data = await import('../pages/FormTest');
          const FormTest = data.default;
          return {
            element: <FormTest />
          };
        },
        // lazy: loadComponent('FormTest')
      },
      {
        path: '/baidu-map',
        lazy: async () => {
          const data = await import('../pages/BMapGLCom');
          const MapComponent = data.default;
          return {
            element: <MapComponent />
          };
        }
        // lazy: loadComponent('BMapGLCom')
      }
    ]
  },
  {
    path: '/account/login',
    // path: '/login',
    element: <Login />
  }
]);
