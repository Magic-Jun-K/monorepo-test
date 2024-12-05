import { createContext } from 'react';

import { CommonTheme } from '../types/theme.types';

export const CommonThemeContext = createContext<CommonTheme | null>(null);
