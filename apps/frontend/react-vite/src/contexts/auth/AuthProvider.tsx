import React, { useState } from 'react';

import { authStore } from '@/store/auth.store';
import { AuthContext } from './auth/AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const setTokens = (access: string) => {
    authStore.setToken(access); // Update singleton（更新单例）
    setAccessToken(access);
  };

  const clearTokens = () => {
    authStore.clear();
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, setTokens, clearTokens }}>
      {children}
    </AuthContext.Provider>
  );
};
