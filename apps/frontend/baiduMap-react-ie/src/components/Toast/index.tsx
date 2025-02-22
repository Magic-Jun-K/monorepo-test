import { useState, useEffect, createContext, useContext } from 'react';
import styles from './index.module.scss';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

interface ToastContextType {
  addToast: (toast: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType>({
  addToast: () => {}
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: ToastProps) => {
    setToasts((prev) => [...prev, toast]);
  };

  const removeToast = (index: number) => {
    setToasts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map((toast, index) => (
          <Toast
            key={index}
            {...toast}
            onClose={() => removeToast(index)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.message}>{message}</div>
    </div>
  );
}
