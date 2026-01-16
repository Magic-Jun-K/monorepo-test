/**
 * Button 组件样式常量定义
 * 包含颜色、类型、尺寸和变体的映射配置
 */

// 颜色主题映射 - 定义不同颜色主题下的样式类名
export const colorMap = {
  primary: {
    filled: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg',
    outlined: 'border border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600',
    text: 'text-blue-500 hover:text-blue-600 hover:bg-blue-50',
  },
  success: {
    filled: 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg',
    outlined: 'border border-green-500 text-green-500 hover:bg-green-50 hover:border-green-600',
    text: 'text-green-500 hover:text-green-600 hover:bg-green-50',
  },
  warning: {
    filled: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg',
    outlined: 'border border-yellow-500 text-yellow-500 hover:bg-yellow-50 hover:border-yellow-600',
    text: 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50',
  },
  danger: {
    filled: 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg',
    outlined: 'border border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600',
    text: 'text-red-500 hover:text-red-600 hover:bg-red-50',
  },
  default: {
    filled: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outlined: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
    text: 'text-gray-700 hover:text-gray-800 hover:bg-gray-50',
  },
} as const;

// 类型映射 - 将组件类型映射到颜色主题
export const typeMap = {
  primary: 'primary',
  default: 'default',
  dashed: 'default',
  text: 'default',
  link: 'primary',
} as const;

// 尺寸映射 - 将自定义尺寸映射到基础组件尺寸
export const sizeMap = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
} as const;

// 变体映射 - 将自定义变体映射到基础组件的 variant
export const variantMap = {
  filled: 'default',
  outlined: 'outline',
  text: 'ghost',
} as const;

// 样式覆盖配置 - 用于覆盖shadcn基础组件的样式
export const styleOverrides = 'gap-0';

// 导出类型定义，便于在其他文件中使用
export type ColorMap = typeof colorMap;
export type TypeMap = typeof typeMap;
export type SizeMap = typeof sizeMap;
export type VariantMap = typeof variantMap;
