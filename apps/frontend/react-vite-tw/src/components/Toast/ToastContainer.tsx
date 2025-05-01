import { observer } from 'mobx-react-lite';

import { toastStore } from '@/store/toast.store';

import styles from './index.module.scss';

export const ToastContainer = observer(() => {
  return (
    <div className={styles.container}>
      {toastStore.toasts.map(toast => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.message}>{toast.message}</div>
        </div>
      ))}
    </div>
  );
});
