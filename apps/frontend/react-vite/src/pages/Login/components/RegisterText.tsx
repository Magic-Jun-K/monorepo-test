import { memo } from 'react';

import { AuthType } from '../types';

import styles from '../index.module.scss';

interface RegisterTextProps {
  authType: AuthType;
  setAuthType: (type: AuthType) => void;
}

export default memo(function RegisterText({ authType, setAuthType }: RegisterTextProps) {
  return (
    <div
      className={styles.registerText}
      style={{ justifyContent: authType === 'login' ? 'space-between' : 'center' }}
    >
      {authType === 'login' ? (
        <a href="#" className={styles.forgot}>
          忘记密码
        </a>
      ) : null}
      <a href="#" onClick={() => setAuthType(authType === 'login' ? 'register' : 'login')}>
        立即{authType === 'login' ? '注册' : '登录'}
      </a>
    </div>
  );
});
