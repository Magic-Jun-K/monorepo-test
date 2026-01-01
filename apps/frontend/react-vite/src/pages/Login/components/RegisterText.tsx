import { memo } from 'react';

import { AuthType } from '../types';

import styles from '../index.module.scss';

interface RegisterTextProps {
  authType: AuthType;
  setAuthType: (type: AuthType) => void;
}

const handleForgotPassword = (e: React.MouseEvent) => {
  e.preventDefault();
};

export default memo(function RegisterText({ authType, setAuthType }: RegisterTextProps) {
  const handleToggleAuthType = (e: React.MouseEvent) => {
    e.preventDefault();
    setAuthType(authType === 'login' ? 'register' : 'login');
  };

  return (
    <div
      className={styles.registerText}
      style={{ justifyContent: authType === 'login' ? 'space-between' : 'center' }}
    >
      {authType === 'login' ? (
        <button
          type="button"
          className={styles.forgot}
          onClick={handleForgotPassword}
        >
          忘记密码
        </button>
      ) : null}
      <button
        type="button"
        onClick={handleToggleAuthType}
      >
        立即{authType === 'login' ? '注册' : '登录'}
      </button>
    </div>
  );
});
