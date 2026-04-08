import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from '@/utils/secureStorage';

interface AuthStore {
  accessToken: string | null;
  isHydrated: boolean;
  setToken: (access: string) => void;
  getAccessToken: () => string | null;
  clear: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get): AuthStore => ({
      accessToken: null,
      isHydrated: false,
      setToken: (access: string) => {
        // 设置一个非敏感的同步标记 Cookie (不含任何 Token 数据)，仅用于 UI 消除闪烁
        document.cookie = 'auth_marker=1; path=/; max-age=604800; SameSite=Strict';
        set({ accessToken: access });
      },
      getAccessToken: () => get().accessToken,
      clear: () => {
        document.cookie = 'auth_marker=; path=/; max-age=0';
        set({ accessToken: null });
      },
      setHydrated: (state: boolean) => set({ isHydrated: state }),
    }),
    {
      name: 'auth-storage-secure',
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ) as unknown as StateCreator<AuthStore>,
);
