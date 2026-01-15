/**
 * @file Button.tsx
 * @description 按钮组件
 */
import { clsx } from 'clsx';
import { forwardRef } from 'react';

import { ButtonProps } from './types';
import { getButtonStyles } from './styles';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'default',
      size = 'md',
      danger = false,
      color = 'default',
      variant = 'filled',
      icon,
      children,
      className,
      htmlType = 'button', // 默认类型为 button
      loading = false,
      ...props
    },
    ref,
  ) => {
    const buttonStyles = getButtonStyles({ type, size, danger, color, variant });

    return (
      <button
        ref={ref}
        type={htmlType}
        className={clsx(buttonStyles, className, {
          'opacity-70 cursor-not-allowed': loading,
          'ant-btn-loading': loading,
        })}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block w-4 h-4 border-t-2 border-r-2 border-current rounded-full animate-spin"></span>
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  },
);
