import React from 'react';

import Login from '../pages/Login';
import Layout from '../layout';
// import MapComponent from '../pages/BMapGLCom';

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
        path: '/home',
        lazy: async () => {
          const data = await import('../pages/Home');
          const Home = data.default;
          return {
            element: <Home />
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
