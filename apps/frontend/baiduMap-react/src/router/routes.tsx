import Login from '../pages/Login';
import Layout from '../layout';

// 路由映射表
export const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <Layout />,
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
      },
      {
        path: '/form-test',
        lazy: async () => {
          const data = await import('../pages/FormTest');
          const FormTest = data.default;
          return {
            element: <FormTest />
          };
        }
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
      }
    ]
  }
];
