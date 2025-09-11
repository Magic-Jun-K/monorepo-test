/**
 * @file Input.tsx
 * @description 输入框组件
 */
import { forwardRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

import type { InputProps } from './types';

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, status, prefix, suffix, allowClear, onClear, value, onChange, onKeyDown, ...props }, ref) => {
  const [internalValue, setInternalValue] = useState(value || '');
  
  // 同步外部value到内部状态
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  const borderColor = status === 'error' ? 'border-red-500' : status === 'warning' ? 'border-yellow-500' : 'border-gray-300';
  
  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      const event = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
    if (onClear) {
      onClear();
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };
  
  const currentValue = value !== undefined ? value : internalValue;
  const showClear = allowClear && currentValue;

  return (
    <div className={`flex items-center border ${borderColor} rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500 transition-colors`}>
      {prefix && <span className="mr-2 text-gray-400">{prefix}</span>}
      <input 
        ref={ref} 
        type="text"
        className={`flex-1 outline-none bg-transparent ${className}`} 
        value={currentValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        {...props} 
      />
      {showClear && (
        <span 
          className="ml-2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          onClick={handleClear}
        >
          <Icon icon="carbon:close" className="w-4 h-4" />
        </span>
      )}
      {suffix && <span className="ml-2 text-gray-400">{suffix}</span>}
    </div>
  );
});
