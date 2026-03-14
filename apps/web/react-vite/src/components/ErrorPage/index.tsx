// import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
// // import { Button, Result } from 'antd'; // 使用 Ant Design 组件（可选）

// type ErrorType = {
//   status?: number;
//   statusText?: string;
//   message?: string;
//   error?: Error;
// };

// export default function ErrorPage() {
//   const error = useRouteError() as ErrorType;
//   console.error('路由错误:', error);

//   // 处理不同错误类型
//   const getErrorContent = () => {
//     // 处理 React Router 响应式错误
//     if (isRouteErrorResponse(error)) {
//       return {
//         status: error.status,
//         title: `${error.status} 错误`,
//         subTitle: error.statusText || '路由加载失败',
//       };
//     }

//     // 处理代码分割加载失败
//     if (error?.error?.name === 'ChunkLoadError') {
//       return {
//         status: 503,
//         title: '资源加载失败',
//         subTitle: '检测到网络不稳定，请检查网络连接后重试',
//       };
//     }

//     // 默认未知错误
//     return {
//       status: 500,
//       title: '未知错误',
//       subTitle: error?.message || '发生了意外错误',
//     };
//   };

//   const { status, title, subTitle } = getErrorContent();

//   return (
//     // <Result
//     //   status={status === 404 ? '404' : 'error'}
//     //   title={status?.toString() || 'Error'}
//     //   subTitle={subTitle}
//     //   extra={
//     //     <>
//     //       <Button type="primary" onClick={() => window.location.reload()}>
//     //         重试
//     //       </Button>
//     //       <Button>
//     //         <Link to="/">返回首页</Link>
//     //       </Button>
//     //     </>
//     //   }
//     // />
//     <div>测试全局报错捕获</div>
//   );
// }