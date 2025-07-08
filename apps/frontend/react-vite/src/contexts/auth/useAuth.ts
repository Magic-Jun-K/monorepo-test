import { useContext } from 'react';

import { AuthContext } from './auth/AuthContext';

export const useAuth = (): NonNullable<React.ContextType<typeof AuthContext>> => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
