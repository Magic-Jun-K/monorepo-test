// import { FC, useEffect } from 'react';
// import { captureMessage, captureException } from '@sentry/react';

// export const SentryTest: FC = () => {
//   useEffect(() => {
//     // 测试 Sentry 消息捕获
//     captureMessage('Sentry 集成测试 - 组件加载');
//   }, []);

//   const handleTestError = () => {
//     // 测试 Sentry 错误捕获
//     captureException(new Error('这是一个测试错误'));
//   };

//   const handleTestMessage = () => {
//     // 测试 Sentry 消息捕获
//     captureMessage('用户点击了测试按钮');
//   };

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg">
//       <h2 className="text-xl font-bold mb-4">Sentry 测试组件</h2>
//       <div className="space-x-4">
//         <button 
//           onClick={handleTestError}
//           className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//         >
//           触发错误
//         </button>
//         <button 
//           onClick={handleTestMessage}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           发送消息
//         </button>
//       </div>
//     </div>
//   );
// };