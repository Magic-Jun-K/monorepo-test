import { create } from 'zustand';

interface AuthStore {
  accessToken: string | null;
  setToken: (access: string) => void;
  getAccessToken: () => string | null;
  clear: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  setToken: (access) => set({ accessToken: access }),
  getAccessToken: () => get().accessToken,
  clear: () => set({ accessToken: null }),
}));
