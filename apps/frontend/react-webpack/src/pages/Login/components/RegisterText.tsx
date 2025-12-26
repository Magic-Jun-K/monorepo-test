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
        <button
          type="button"
          className="text-blue-500 cursor-pointer"
          onClick={() => console.log('忘记密码 clicked')}
        >
          忘记密码
        </button>
      ) : null}
      <button
        className="text-blue-500 cursor-pointer"
        type="button"
        onClick={() => setAuthType(authType === 'login' ? 'register' : 'login')}
      >
        立即{authType === 'login' ? '注册' : '登录'}
      </button>
    </div>
  );
});
