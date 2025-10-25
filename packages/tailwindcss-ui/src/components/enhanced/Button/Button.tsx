import { forwardRef } from 'react';

import { Button as BaseButton } from '@/components/ui/button';
import type { ButtonProps, ButtonColorType, ButtonVariantType } from './types';
import { colorMap, typeMap, sizeMap, variantMap } from './constants';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'default',
      size = 'md',
      danger = false,
      color,
      variant = 'filled',
      icon,
      children,
      className,
      htmlType = 'button',
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    // 确定最终的颜色和变体
    let finalColor: ButtonColorType;
    let finalVariant: ButtonVariantType;

    if (color) {
      // 如果指定了颜色，使用指定的颜色和变体
      finalColor = color;
      finalVariant = variant;
    } else if (type === 'primary' && danger) {
      // 主要按钮 + 危险状态
      finalColor = 'danger';
      finalVariant = 'filled';
    } else if (danger) {
      // 危险状态
      finalColor = 'danger';
      finalVariant = variant;
    } else {
      // 根据类型映射
      finalColor = typeMap[type] as ButtonColorType;
      finalVariant =
        type === 'dashed' ? 'outlined' : type === 'text' || type === 'link' ? 'text' : variant;
    }

    // 获取样式类名
    const classes = colorMap[finalColor][finalVariant];

    // 虚线按钮特殊处理
    const dashedClasses = type === 'dashed' ? 'border-dashed' : '';

    // 链接按钮特殊处理
    const linkClasses = type === 'link' ? 'underline-offset-4 hover:underline' : '';

    // 构建最终的类名
    const finalClassName = `${classes} ${dashedClasses} ${linkClasses} ${className || ''}`.trim();

    return (
      <BaseButton
        ref={ref}
        type={htmlType}
        size={sizeMap[size]}
        variant={variantMap[finalVariant]}
        className={finalClassName}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block w-4 h-4 border-t-2 border-r-2 border-current rounded-full animate-spin" />
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </BaseButton>
    );
  }
);

Button.displayName = 'Button';