import { memo } from 'react';

import styles from '../index.module.scss';

interface LoginTabsProps {
  authType: 'login' | 'register';
  loginType: 'email' | 'account';
  setLoginType: (type: 'email' | 'account') => void;
}

export default memo(function LoginTabs({ authType, loginType, setLoginType }: LoginTabsProps) {
  return (
    <div className={styles.tabs}>
      {authType === 'login' ? (
        <>
          <div className={`${styles.tab} ${loginType === 'account' ? styles.active : ''}`}>
            <span onClick={() => setLoginType('account')}>账号登录</span>
          </div>
          <div className={`${styles.tab} ${loginType === 'email' ? styles.active : ''}`}>
            <span onClick={() => setLoginType('email')}>邮箱登录</span>
          </div>
        </>
      ) : (
        <div className={`${styles.tab} ${styles.active}`}>
          <span>注册账号</span>
        </div>
      )}
    </div>
  );
});
