import { clsx } from 'clsx';
import type { ButtonProps } from './types';

export const getButtonStyles = ({
  type,
  size,
  danger,
  color,
  variant
}: Pick<ButtonProps, 'type' | 'size' | 'danger' | 'color' | 'variant'>) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded font-medium transition-colors cursor-pointer';

  // 处理类型和危险状态
  const typeClasses = clsx({
    'bg-blue-500 hover:bg-blue-600 text-white': type === 'primary' && !danger,
    'bg-red-500 hover:bg-red-600 text-white': (type === 'primary' && danger) || color === 'danger',
    'bg-gray-200 hover:bg-gray-300 text-gray-800': type === 'default' && !danger,
    'border border-gray-300 hover:border-blue-500': type === 'dashed',
    'hover:bg-gray-100': type === 'text',
    'text-blue-500 hover:text-blue-600': type === 'link'
  });

  // 处理颜色和变体
  const colorVariantClasses = clsx({
    // 填充变体
    'bg-blue-500 hover:bg-blue-600 text-white': color === 'primary' && variant === 'filled',
    'bg-green-500 hover:bg-green-600 text-white': color === 'success' && variant === 'filled',
    'bg-yellow-500 hover:bg-yellow-600 text-white': color === 'warning' && variant === 'filled',
    'bg-red-500 hover:bg-red-600 text-white': color === 'danger' && variant === 'filled',
    'bg-gray-200 hover:bg-gray-300 text-gray-800': color === 'default' && variant === 'filled',

    // 轮廓变体
    'border border-blue-500 text-blue-500 hover:bg-blue-50':
      color === 'primary' && variant === 'outlined',
    'border border-green-500 text-green-500 hover:bg-green-50':
      color === 'success' && variant === 'outlined',
    'border border-yellow-500 text-yellow-500 hover:bg-yellow-50':
      color === 'warning' && variant === 'outlined',
    'border border-red-500 text-red-500 hover:bg-red-50':
      color === 'danger' && variant === 'outlined',
    'border border-gray-300 text-gray-700 hover:bg-gray-50':
      color === 'default' && variant === 'outlined',

    // 文本变体
    'text-blue-500 hover:bg-blue-50': color === 'primary' && variant === 'text',
    'text-green-500 hover:bg-green-50': color === 'success' && variant === 'text',
    'text-yellow-500 hover:bg-yellow-50': color === 'warning' && variant === 'text',
    'text-red-500 hover:bg-red-50': color === 'danger' && variant === 'text',
    'text-gray-700 hover:bg-gray-50': color === 'default' && variant === 'text'
  });

  const sizeClasses = clsx({
    'h-8 px-3 text-sm': size === 'sm',
    'h-9 px-4': size === 'md',
    'h-10 px-6 text-lg': size === 'lg'
  });

  // 优先使用 color 和 variant 的样式，如果没有设置则使用 type 的样式
  const finalClasses =
    color !== 'default' || variant !== 'filled' ? colorVariantClasses : typeClasses;

  return clsx(baseClasses, finalClasses, sizeClasses);
};
