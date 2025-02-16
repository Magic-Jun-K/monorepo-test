/**
 * @file Select.tsx
 * @description 选择器组件
 */
import { useState, useRef, useEffect } from 'react';

import type { SelectProps } from './types';

export const Select = ({ options, value, onChange, placeholder, disabled }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`flex items-center justify-between p-2 border rounded-md cursor-pointer ${
          disabled ? 'bg-gray-100' : 'hover:border-blue-500'
        } ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={!selectedOption ? 'text-gray-400' : ''}>{selectedOption?.label || placeholder}</span>
        <span className="text-gray-400">▾</span>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {options.map(option => (
            <div
              key={option.value}
              className={`p-2 hover:bg-blue-50 cursor-pointer ${
                option.disabled ? 'text-gray-400 cursor-not-allowed' : ''
              } ${value === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => {
                if (!option.disabled) {
                  onChange?.(option.value);
                  setIsOpen(false);
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
