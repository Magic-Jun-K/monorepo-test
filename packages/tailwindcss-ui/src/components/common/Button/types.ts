import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'filled' | 'outlined' | 'text';
export type ButtonColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';

// 更明确地定义 ButtonProps 类型，确保包含 children 属性
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * 按钮类型（组件级别）
   */
  type?: ButtonType;
  /**
   * 按钮原生类型（HTML 级别）
   */
  htmlType?: 'button' | 'submit' | 'reset';
  /**
   * 按钮大小
   */
  size?: ButtonSize;
  /**
   * 是否危险状态
   */
  danger?: boolean;
  /**
   * 按钮图标
   */
  icon?: ReactNode;
  /**
   * 颜色主题
   */
  color?: ButtonColor;
  /**
   * 按钮变体
   */
  variant?: ButtonVariant;
  /**
   * 是否加载中
   */
  loading?: boolean;
  /**
   * 子元素
   */
  children?: ReactNode;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

export type ButtonColorType = 'primary' | 'success' | 'warning' | 'danger' | 'default';
export type ButtonVariantType = 'filled' | 'outlined' | 'text';