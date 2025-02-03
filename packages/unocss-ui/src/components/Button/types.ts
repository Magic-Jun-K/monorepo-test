import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonType = 'primary' | 'dashed' | 'text' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

// 使用 Omit 移除原生 type 属性
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ButtonType;
  size?: ButtonSize;
  danger?: boolean;
  icon?: ReactNode;
  htmlType?: 'button' | 'submit' | 'reset'; // 添加原生类型支持
}
