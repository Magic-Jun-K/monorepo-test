import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonVariant = 'filled' | 'outlined' | 'text';
type ButtonColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';

// 使用 Omit 移除原生 type 属性
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 按钮类型
   */
  type?: ButtonType;
  /**
   * 按钮大小
   */
  size?: ButtonSize;
  /**
   * 是否危险
   */
  danger?: boolean;
  /**
   * 按钮图标
   */
  icon?: ReactNode;
  /**
   * 按钮原生类型
   */
  htmlType?: 'button' | 'submit' | 'reset';
  /**
   * 按钮颜色
   */
  color?: ButtonColor;
  /**
   * 按钮变体
   */
  variant?: ButtonVariant;
}
