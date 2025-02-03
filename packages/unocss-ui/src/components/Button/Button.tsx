import { clsx } from 'clsx';

import { ButtonProps } from './types';

export const Button = ({
  type = 'primary',
  size = 'md',
  danger = false,
  icon,
  children,
  className,
  htmlType = 'button', // 默认类型为 button
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded font-medium transition-colors';

  const variantClasses = clsx({
    'bg-blue-500 hover:bg-blue-600 text-white': type === 'primary' && !danger,
    'bg-red-500 hover:bg-red-600 text-white': type === 'primary' && danger,
    'border border-gray-300 hover:border-blue-500': type === 'dashed',
    'hover:bg-gray-100': type === 'text',
    'text-blue-500 hover:text-blue-600': type === 'link'
  });

  const sizeClasses = clsx({
    'h-8 px-3 text-sm': size === 'sm',
    'h-9 px-4': size === 'md',
    'h-10 px-6 text-lg': size === 'lg'
  });

  return (
    <button
      type={htmlType} // 使用原生 type 属性
      className={clsx(baseClasses, variantClasses, sizeClasses, className)}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
