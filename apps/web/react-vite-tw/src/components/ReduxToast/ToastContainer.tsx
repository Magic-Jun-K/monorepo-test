import { useSelector } from 'react-redux';

import { RootState } from '@/stores/redux/toast.store';

import styles from './index.module.scss';

export const ToastContainer = () => {
  // 使用useSelector钩子从Redux store获取toasts数组
  const toasts = useSelector((state: RootState) => state.toast.toasts);

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.message}>{toast.message}</div>
        </div>
      ))}
    </div>
  );
};
