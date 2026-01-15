/**
 * @file Input.tsx
 * @description 输入框组件
 */
import { forwardRef } from 'react';

import type { InputProps } from './types';

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, status, prefix, suffix, ...props }, ref) => {
  const borderColor = status === 'error' ? 'border-red-500' : status === 'warning' ? 'border-yellow-500' : 'border-gray-300';

  return (
    <div className={`flex items-center border ${borderColor} rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500 transition-colors`}>
      {prefix && <span className="mr-2 text-gray-400">{prefix}</span>}
      <input ref={ref} className={`flex-1 outline-none bg-transparent ${className}`} {...props} />
      {suffix && <span className="ml-2 text-gray-400">{suffix}</span>}
    </div>
  );
});
