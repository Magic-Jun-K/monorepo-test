import { useToastStore } from '@/stores/zustand/toast.store';

import styles from './index.module.scss';

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.message}>{toast.message}</div>
        </div>
      ))}
    </div>
  );
};
