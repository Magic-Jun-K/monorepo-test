import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonType = 'primary' | 'dashed' | 'text' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

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
  htmlType?: 'button' | 'submit' | 'reset'; // 添加原生类型支持
}
