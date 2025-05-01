import { createContext, useContext } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

interface ToastContextType {
  addToast: (toast: ToastProps) => void;
}

export const ToastContext = createContext<ToastContextType>({
  addToast: () => {}
});

export function useToast() {
  return useContext(ToastContext);
}
