import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

// 定义初始状态
interface ToastState {
  toasts: ToastItem[];
}

const initialState: ToastState = {
  toasts: []
};

// 创建slice
const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<ToastItem, 'id'>>) => {
      const id = Date.now();
      state.toasts.push({ ...action.payload, id });
      // 不要在reducer中返回id，这会导致类型错误
      // 应该通过action.payload传递或使用其他方式获取
      // return id;
    },
    removeToast: (state, action: PayloadAction<number>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    }
  }
});

// 导出actions
export const { addToast, removeToast } = toastSlice.actions;

// 创建store
export const store = configureStore({
  reducer: {
    toast: toastSlice.reducer
  }
});

// 定义RootState类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 创建辅助函数，类似于原来的success, error, info方法
export const toastActions = {
  success: (message: string, duration = 3000) => {
    const id = Date.now(); // 在这里生成id
    store.dispatch(addToast({ message, type: 'success', duration }));
    setTimeout(() => {
      store.dispatch(removeToast(id));
    }, duration);
    return id;
  },
  error: (message: string, duration = 3000) => {
    const id = Date.now(); // 在这里生成id
    store.dispatch(addToast({ message, type: 'error', duration }));
    setTimeout(() => {
      store.dispatch(removeToast(id));
    }, duration);
    return id;
  },
  info: (message: string, duration = 3000) => {
    const id = Date.now(); // 在这里生成id;
    store.dispatch(addToast({ message, type: 'info', duration }));
    setTimeout(() => {
      store.dispatch(removeToast(id));
    }, duration);
    return id;
  }
};

// 导出toast actions供组件使用
export default toastActions;
