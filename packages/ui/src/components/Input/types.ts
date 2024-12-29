import React from 'react';

export const inputSizes = ['xs', 'sm', 'md', 'lg'] as const;
export type InputSize = (typeof inputSizes)[number];

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * 输入框大小
   */
  size?: InputSize;
  /**
   * 错误状态
   */
  error?: boolean;
  /**
   * 错误信息
   */
  errorMessage?: string;
  /**
   * 左侧图标
   */
  leftIcon?: React.ReactNode;
  /**
   * 右侧图标
   */
  rightIcon?: React.ReactNode;
  /**
   * 是否撑满父容器宽度
   */
  fullWidth?: boolean;
}
