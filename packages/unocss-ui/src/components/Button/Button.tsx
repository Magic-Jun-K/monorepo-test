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
      ...props
    },
    ref
  ) => {
    const buttonStyles = getButtonStyles({ type, size, danger, color, variant });

    return (
      <button ref={ref} type={htmlType} className={clsx(buttonStyles, className)} {...props}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);
