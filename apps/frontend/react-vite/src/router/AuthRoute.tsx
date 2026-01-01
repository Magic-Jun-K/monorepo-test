import { FC, useEffect, useState, useRef } from 'react';
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (loading) {
      interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '.' : prev + '.'));
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!loading) {
      if (showHelp) {
        setTimeout(() => setShowHelp(false), 0);
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setShowHelp(true);
    }, 8000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [loading, showHelp]);

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
              type="button"
              onClick={() => window.location.reload()}
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
