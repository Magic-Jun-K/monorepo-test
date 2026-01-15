/**
 * @file Input.tsx
 * @description 输入框组件
 */
import { forwardRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Icon } from '@iconify/react';

import type { InputProps } from './types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      status,
      prefix,
      suffix,
      allowClear,
      onClear,
      value,
      onChange,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState('');

    const currentValue = isControlled ? value : internalValue;
    const borderColor =
      status === 'error'
        ? 'border-red-500'
        : status === 'warning'
          ? 'border-yellow-500'
          : 'border-gray-300';

    const handleClear = () => {
      if (isControlled) {
        if (onChange) {
          const event = {
            target: { value: '' },
          } as ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
      } else {
        setInternalValue('');
      }
      if (onClear) {
        onClear();
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      if (onChange) {
        onChange(e);
      }
    };

    const showClear = allowClear && currentValue;

    return (
      <div
        className={`flex items-center border ${borderColor} rounded-md px-3 py-2 focus-within:ring-2 ring-blue-500 transition-colors`}
      >
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
          <button
            type="button"
            className="ml-2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors bg-transparent border-0 p-0"
            onClick={handleClear}
            aria-label="清除"
          >
            <Icon icon="carbon:close" className="w-4 h-4" />
          </button>
        )}
        {suffix && <span className="ml-2 text-gray-400">{suffix}</span>}
      </div>
    );
  },
);
