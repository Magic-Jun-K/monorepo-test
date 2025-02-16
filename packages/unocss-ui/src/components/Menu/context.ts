import { createContext, useContext } from 'react';
import type { MenuMode, MenuTheme } from './types';

export interface MenuContextProps {
  mode: MenuMode;
  theme?: MenuTheme;
  selectedKeys: string[];
  openKeys: string[];
  onSelect?: (key: string) => void;
  onOpenChange?: (keys: string[]) => void;
}

export const MenuContext = createContext<MenuContextProps>({
  mode: 'vertical',
  selectedKeys: [],
  openKeys: [],
});

export const useMenuContext = () => useContext(MenuContext); 