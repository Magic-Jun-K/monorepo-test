import type { InputHTMLAttributes, ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputStatus = 'error' | 'warning';
export type InputVariant = 'outlined' | 'filled' | 'borderless';

// Input 组件的属性接口
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /**
   * 输入框大小
   */
  size?: InputSize;
  /**
   * 输入框状态
   */
  status?: InputStatus;
  /**
   * 输入框变体
   */
  variant?: InputVariant;
  /**
   * 前缀图标
   */
  prefix?: ReactNode;
  /**
   * 后缀图标
   */
  suffix?: ReactNode;
  /**
   * 是否显示清除图标
   */
  allowClear?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 自定义样式类名
   */
  className?: string;
}