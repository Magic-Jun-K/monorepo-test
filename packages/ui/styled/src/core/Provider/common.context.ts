import { createContext } from 'react';
// export interface CommonContextValue {}
export type CommonContextValue = object;

export const CommonContext = createContext<CommonContextValue | null>(null);
