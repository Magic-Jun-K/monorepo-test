import { create } from 'zustand';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => number;
  removeToast: (id: number) => void;
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration);

    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  success: (message, duration = 3000) => {
    return get().addToast({ message, type: 'success', duration });
  },
  error: (message, duration = 3000) => {
    return get().addToast({ message, type: 'error', duration });
  },
  info: (message, duration = 3000) => {
    return get().addToast({ message, type: 'info', duration });
  },
}));
