import React, { useMemo } from 'react';

import { CommonThemeOverrides } from '../types/theme.types';

import { DEFAULT_THEME } from './default-theme';
import { CommonThemeContext } from './CommonTheme.context';
import { useSafeCommonTheme } from './useCommonTheme';

export interface CommonThemeProviderProps {
  /** Determines whether theme should be inherited from parent CommonProvider, `true` by default */
  inherit?: boolean;

  /** Theme override object */
  theme?: CommonThemeOverrides;

  /** Your application or part of the application that requires different theme */
  children?: React.ReactNode;
}

export function CommonThemeProvider({ theme, children, inherit = true }: CommonThemeProviderProps) {
  const parentTheme = useSafeCommonTheme();
  const mergedTheme = useMemo(() => Object.assign(inherit ? parentTheme : DEFAULT_THEME, theme), [theme, parentTheme, inherit]);

  return <CommonThemeContext.Provider value={mergedTheme}>{children}</CommonThemeContext.Provider>;
}

CommonThemeProvider.displayName = '@common/ui/CommonThemeProvider';
