import { createContext, useContext } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
}

export const ToastContext = createContext<ToastContextType>({
  addToast: () => {}
});

export function useToast() {
  return useContext(ToastContext);
}
