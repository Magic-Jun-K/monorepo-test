import { FC, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthCheck } from '@/hooks/useAuthCheck';

import styles from './AuthRoute.module.scss';

interface AuthRouteProps {
  children: JSX.Element;
  roles?: string[];
}

const AuthRoute: FC<AuthRouteProps> = ({ children }) => {
  const { loading, isAuthenticated } = useAuthCheck();
  const [dots, setDots] = useState('.');
  const [showHelp, setShowHelp] = useState(false);

  // 动态点动画
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (loading) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // 超时提示
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (loading) {
      timer = setTimeout(() => {
        setShowHelp(true);
      }, 8000);
    } else {
      setShowHelp(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <div className={styles.loadingText}>
          正在验证身份<span className={styles.dotsAnimation}>{dots}</span>
        </div>
        <div className={styles.subText}>我们正在检查您的登录状态，确保您的账户安全</div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} />
        </div>

        {showHelp && (
          <div className={styles.helpText}>
            验证时间较长，请检查网络连接或
            <button
              onClick={() => window.location.reload()}
              className={styles.refreshButton}
              type="button"
            >
              刷新页面
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/account/login?redirect=${window.location.pathname}`} />;
  }

  // 如果用户已登录，渲染子组件
  return children;
};
export default AuthRoute;
