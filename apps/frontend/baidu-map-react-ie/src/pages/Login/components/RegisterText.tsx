import { AuthType } from '../types';
import styles from '../index.module.scss';

interface RegisterTextProps {
  authType: AuthType;
  setAuthType: (type: AuthType) => void;
}

export default function RegisterText({ authType, setAuthType }: RegisterTextProps) {
  return (
    <div className={styles.registerText}>
      {authType === 'login' ? '没' : '已'}有账号？
      <a href="#" onClick={() => setAuthType(authType === 'login' ? 'register' : 'login')}>
        立即{authType === 'login' ? '注册' : '登录'}
      </a>
    </div>
  );
}
