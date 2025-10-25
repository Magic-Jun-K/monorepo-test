/**
 * Input 组件样式常量定义
 * 包含尺寸、状态和变体的映射配置
 */

// 状态样式映射
export const statusMap = {
  error: 'border-red-500 focus-visible:ring-red-500',
  warning: 'border-yellow-500 focus-visible:ring-yellow-500'
} as const;

// 变体样式映射
export const variantMap = {
  outlined: 'bg-transparent border border-input',
  filled: 'bg-gray-100 border border-input hover:bg-gray-200',
  borderless: 'border-0 bg-transparent'
} as const;

// 尺寸样式映射
export const sizeClassMap = {
  sm: 'h-8 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10 text-base'
} as const;

// 默认样式
export const defaultInputClasses = 'w-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

// 导出类型定义
export type StatusMap = typeof statusMap;
export type VariantMap = typeof variantMap;
export type SizeClassMap = typeof sizeClassMap;