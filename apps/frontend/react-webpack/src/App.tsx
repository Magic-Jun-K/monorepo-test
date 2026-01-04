import { FC, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { captureMessage } from '@sentry/react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import { initWebVitals, initPerformanceChecker, measurePageLoad, measureResourceLoad } from '@/utils/performance';
import { router } from './router/index';
import { setupErrorHandlers } from './utils/errorHandler';

import '@/styles/index.scss';
import '@/styles/font.scss';
// import '@eggshell/unocss-ui/lib/index.css'; // 直接引入样式
import '@eggshell/antd-ui/es/index.css';
import '@eggshell/tailwindcss-ui/lib/index.css';

setupErrorHandlers(); // 设置错误处理器

const App: FC = () => {
  useEffect(() => {
    // 初始化 Web Vitals 监控
    initWebVitals();
    initPerformanceChecker();
    
    // 测量页面加载性能
    measurePageLoad();
    measureResourceLoad();
    
    // 测试 Sentry 是否正常工作
    captureMessage('Sentry 集成测试');
    
    // 测试错误捕获
    // setTimeout(() => {
    //   captureException(new Error('测试错误捕获'));
    // }, 5000);
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};
export default App;