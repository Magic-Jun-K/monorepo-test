import { createContext, useContext } from 'react';

export const DropdownContext = createContext<{ closeMenu: () => void } | null>(null);

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
};
