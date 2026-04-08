import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from '@/utils/secureStorage';

interface User {
  roles?: { code: string }[];
}

interface UserStore {
  currentUser: User | null;
  userRoles: string[];
  isAdmin: boolean;
  setCurrentUser: (user: User | null) => void;
  getCurrentUser: () => User | null;
  getUserRoles: () => string[];
  getIsAdmin: () => boolean;
  hasRole: (roleCode: string) => boolean;
  hasAnyRole: (roleCodes: string[]) => boolean;
  clear: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get): UserStore => ({
      currentUser: null,
      userRoles: [],
      isAdmin: false,
      setCurrentUser: (user: User | null) => {
        if (user?.roles) {
          const roles = user.roles.map((role) => role.code);
          const isAdmin = roles.some(
            (role) => role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'USER_MANAGER',
          );
          set({ currentUser: user, userRoles: roles, isAdmin });
        } else {
          set({ currentUser: user, userRoles: [], isAdmin: false });
        }
      },
      getCurrentUser: () => get().currentUser,
      getUserRoles: () => get().userRoles,
      getIsAdmin: () => get().isAdmin,
      hasRole: (roleCode: string) => get().userRoles.includes(roleCode),
      hasAnyRole: (roleCodes: string[]) => roleCodes.some((role) => get().userRoles.includes(role)),
      clear: () => set({ currentUser: null, userRoles: [], isAdmin: false }),
    }),
    {
      name: 'user-storage-secure',
      storage: createJSONStorage(() => secureStorage),
    },
  ) as unknown as StateCreator<UserStore>,
);
