import { FC, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { captureMessage } from '@sentry/react';

import { ErrorBoundary } from '@/components/ErrorBoundary';

import { initMonitor } from '@/utils/monitor';
import { router } from './router/index';
import { setupErrorHandlers } from './utils/errorHandler';

import '@/styles/index.scss';
import '@/styles/font.scss';
import '@eggshell/ui-antd/lib/index.css';
import '@eggshell/ui-tailwind/lib/index.css';

setupErrorHandlers(); // 设置错误处理器

const App: FC = () => {
  useEffect(() => {
    // 初始化自建监控平台 (同时集成 Sentry)
    initMonitor({
      appId: 'react-webpack-app',
      reportUrl: 'http://localhost:7002/collect/performance', // 这里的地址后续可配置到环境变量
      errorReportUrl: 'http://localhost:7002/collect/error', // 明确指定错误上报地址
      enableSentry: true,
    });

    // 测试 Sentry 是否正常工作
    captureMessage('Sentry 集成测试');
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};
export default App;
