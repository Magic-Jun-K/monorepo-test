import { createContext } from 'react';

export interface AuthContextType {
  accessToken: string | null;
  setTokens: (access: string) => void;
  clearTokens: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
