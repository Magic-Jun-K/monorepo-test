import { memo } from 'react';
import clsx from 'clsx';

import styles from '../index.module.scss';

interface LoginTabsProps {
  authType: 'login' | 'register';
  loginType: 'email' | 'account';
  setLoginType: (type: 'email' | 'account') => void;
}

export default memo(
  function LoginTabs({ authType, loginType, setLoginType }: LoginTabsProps) {
    return (
      <div className={styles.tabs}>
        {authType === 'login' ? (
          <>
            <button
              type="button"
              className={clsx(styles.tab, loginType === 'account' && styles.active)}
              onClick={() => setLoginType('account')}
            >
              <span>账号登录</span>
            </button>
            <button
              type="button"
              className={clsx(styles.tab, loginType === 'email' && styles.active)}
              onClick={() => setLoginType('email')}
            >
              <span>邮箱登录</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className={clsx(styles.tab, styles.active)}
            onClick={() => setLoginType('account')}
          >
            <span>注册账号</span>
          </button>
        )}
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.authType === nextProps.authType && prevProps.loginType === nextProps.loginType
);
