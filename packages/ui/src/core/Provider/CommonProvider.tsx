import React from 'react';

import { CommonThemeProvider } from '../ThemeProvider/CommonThemeProvider';
import { CommonThemeOverrides } from '../types/theme.types';

import { CommonContext } from './Common.context';

import '../ThemeProvider/global.css';

export interface CommonProviderProps {
  /**
   * The theme overrides to apply.
   */
  theme?: CommonThemeOverrides;
  /**
   * The children to render.
   */
  children?: React.ReactNode;
}

export const CommonProvider: React.FC<CommonProviderProps> = ({ theme, children }) => {
  return (
    <CommonContext.Provider value={{}}>
      <CommonThemeProvider theme={theme}>{children}</CommonThemeProvider>
    </CommonContext.Provider>
  );
};

CommonProvider.displayName = '@common/ui/CommonProvider';
