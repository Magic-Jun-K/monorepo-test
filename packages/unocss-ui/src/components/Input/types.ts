import type { InputHTMLAttributes } from 'react';

// 使用 Omit 排除原生不存在的属性
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  /**
   * 状态
   */
  status?: 'error' | 'warning';
  /**
   * 前缀
   */
  prefix?: React.ReactNode;
  /**
   * 后缀
   */
  suffix?: React.ReactNode;
}
