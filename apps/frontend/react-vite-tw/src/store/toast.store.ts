import { makeAutoObservable } from 'mobx';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

class ToastStore {
  toasts: ToastItem[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addToast(toast: Omit<ToastItem, 'id'>) {
    const id = Date.now();
    this.toasts.push({ ...toast, id });

    setTimeout(() => {
      this.removeToast(id);
    }, toast.duration);

    return id;
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  success(message: string, duration = 3000) {
    return this.addToast({ message, type: 'success', duration });
  }

  error(message: string, duration = 3000) {
    return this.addToast({ message, type: 'error', duration });
  }

  info(message: string, duration = 3000) {
    return this.addToast({ message, type: 'info', duration });
  }
}

export const toastStore = new ToastStore();
