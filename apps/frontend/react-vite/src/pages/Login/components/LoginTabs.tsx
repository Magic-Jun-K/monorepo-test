import styles from '../index.module.scss';

interface LoginTabsProps {
  loginType: 'phone' | 'account';
  setLoginType: (type: 'phone' | 'account') => void;
}

export default function LoginTabs({ loginType, setLoginType }: LoginTabsProps) {
  return (
    <div className={styles.tabs}>
      <div className={`${styles.tab} ${loginType === 'account' ? styles.active : ''}`} onClick={() => setLoginType('account')}>
        <span>账号登录</span>
      </div>
      <div className={`${styles.tab} ${loginType === 'phone' ? styles.active : ''}`} onClick={() => setLoginType('phone')}>
        <span>手机登录</span>
      </div>
    </div>
  );
}
