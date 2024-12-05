export type CommonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface VariantColorResolverResult {
  background: string;
  hover: string;
  color: string;
  border: string;
  hoverColor?: string;
}

// export interface CommonTheme {}
export type CommonTheme = object;

// need replace partial to deepPartial use type-fest
export type CommonThemeOverrides = Partial<CommonTheme>;
