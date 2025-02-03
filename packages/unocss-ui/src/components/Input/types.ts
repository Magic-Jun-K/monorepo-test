import type { InputHTMLAttributes } from 'react';

// 使用 Omit 排除原生不存在的属性
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  status?: 'error' | 'warning';
  prefix?: React.ReactNode; // 保持 ReactNode 类型
  suffix?: React.ReactNode;
}
