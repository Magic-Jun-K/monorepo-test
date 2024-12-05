import { useContext } from 'react';

import { DEFAULT_THEME } from './default-theme';
import { CommonThemeContext } from './CommonTheme.context';

export const useSafeCommonTheme = () => useContext(CommonThemeContext) || DEFAULT_THEME;

export const useCommonTheme = () => {
  const ctx = useContext(CommonThemeContext);
  if (!ctx) {
    throw new Error('@common/ui: CommonProvider was not found in component tree, make sure you have it in your app');
  }

  return ctx;
};
