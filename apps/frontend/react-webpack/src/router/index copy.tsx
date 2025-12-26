// import { createBrowserRouter } from 'react-router-dom';

// import Layout from '../layout';
// import AuthRoute from './AuthRoute';
// import Login from '../pages/Login';

// type PickRouter<T> = T extends (...args: any[]) => infer R ? R : never;

// type A = typeof createBrowserRouter;

// export const loadComponent = (path: string) => {
//   return () => import(/* @vite-ignore */ `../pages/${path}/index`).then(module => ({
//     Component: module.default
//   }));
// };

// // 路由映射表
// export const router: PickRouter<A> = createBrowserRouter([
//   {
//     path: '/',
//     element: (
//       <AuthRoute>
//         <Layout />
//       </AuthRoute>
//     ),
//     children: [
//       {
//         index: true, // 当访问根路径时，默认渲染 Home 组件
//         // lazy: () => import('../pages/Home').then(module => ({
//         //   Component: module.default // 关键区别：返回 Component 而非 element
//         // }))
//         lazy: loadComponent('Home')
//       },
//       {
//         path: 'image-test',
//         lazy: loadComponent('ImageTest')
//       },
//       {
//         path: 'form-test',
//         lazy: loadComponent('FormTest')
//       },
//       {
//         path: 'table-test',
//         lazy: loadComponent('TableTest')
//       },
//       {
//         path: 'virtual-list-test',
//         lazy: loadComponent('VirtualListTest')
//       },
//       {
//         path: 'baidu-map',
//         lazy: loadComponent('BMapGLCom')
//       },
//       {
//         path: 'user-management',
//         lazy: loadComponent('User')
//       },
//       {
//         path: 'tailwind-test',
//         lazy: loadComponent('TailwindTest')
//       }
//     ]
//   },
//   {
//     path: '/account/login',
//     // path: '/login',
//     element: <Login />
//   }
// ]);
