import { FC /* useEffect */ } from 'react';
import { RouterProvider } from 'react-router-dom';
// import { init, browserTracingIntegration } from '@sentry/react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { router } from './router/index';
// import { initWebVitals, initPerformanceChecker } from '@/utils/performance';
import { ToastContainer } from '@/components/Toast/ToastContainer';

import '@/assets/css/index.scss';
import '@/assets/css/font.scss';
import '@eggshell/unocss-ui/build/es/index.css';

const App: FC = () => {
  // useEffect(() => {
  //   init({
  //     dsn: 'https://89f7621f48c7fa98c40d0027ef411518@o4508624159244288.ingest.de.sentry.io/4508624202104912',
  //     // integrations集成
  //     integrations: [browserTracingIntegration()], // browserTracingIntegration是Sentry的一个跟踪集成，它会捕获浏览器的资源加载时间，Ajax请求，用户行为等信息，从而帮助开发者更好地理解应用的性能状况和用户行为模式。
  //     tracesSampleRate: 1.0 // 设置跟踪采样率
  //   });

  //   // if (process.env.NODE_ENV === 'production') {
  //   // initWebVitals();
  //   // initPerformanceChecker();
  //   // }
  // }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <ToastContainer />
    </ErrorBoundary>
  );
};
export default App;
