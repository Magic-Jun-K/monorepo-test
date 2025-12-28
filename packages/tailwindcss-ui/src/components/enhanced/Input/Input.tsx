import { forwardRef, useState, useRef, useEffect, useImperativeHandle } from 'react';
import { X } from 'lucide-react';

import { Input as BaseInput } from '@/components/ui/input';
import type { InputProps } from './types';
import { statusMap, variantMap, sizeClassMap, defaultInputClasses } from './constants';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      status,
      variant = 'outlined',
      prefix,
      suffix,
      allowClear,
      className,
      disabled,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    // 内部状态管理输入框的值
    const [inputValue, setInputValue] = useState(value || defaultValue || '');
    const internalRef = useRef<HTMLInputElement>(null);

    // 暴露内部ref给外部使用
    useImperativeHandle(ref, () => internalRef.current as unknown as HTMLInputElement);

    // 当外部value变化时，更新内部状态
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(value);
      }
    }, [value]);

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // 对于受控组件，只有在没有显式设置value时才更新内部状态
      if (value === undefined) {
        setInputValue(newValue);
      }
      onChange?.(e);
    };

    // 清除输入框内容
    const handleClear = () => {
      // 对于受控组件，只触发onChange事件
      const event = {
        target: {
          value: '',
          name: props.name,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);

      // 对于非受控组件，更新内部状态
      if (value === undefined) {
        setInputValue('');
      }

      // 聚焦到输入框
      if (internalRef.current) {
        internalRef.current.focus();
      }
    };

    // 判断是否显示清除图标
    const showClearIcon =
      allowClear && !disabled && (value !== undefined ? value : inputValue) !== '';

    // 获取基础样式类
    const baseClasses = defaultInputClasses;

    // 获取变体样式类
    const variantClasses = variantMap[variant];

    // 获取尺寸样式类
    const sizeClasses = sizeClassMap[size];

    // 获取状态样式类
    const statusClasses = status ? statusMap[status] : '';

    // 构建最终的类名
    const finalClassName =
      `${baseClasses} ${variantClasses} ${sizeClasses} ${statusClasses} ${className || ''}`.trim();

    // 如果有前缀、后缀或清除图标，我们需要包裹输入框
    // 始终渲染容器，避免因showClearIcon变化导致的重新渲染
    return (
      <div
        data-testid="input-container"
        className={`
          inline-flex items-center rounded-md transition-colors w-full max-w-full
          ${variant === 'filled' ? 'bg-gray-100 hover:bg-gray-200' : ''}
          ${status === 'error' ? 'border border-red-500' : 'border border-input'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${size === 'sm' ? 'h-8' : size === 'lg' ? 'h-10' : 'h-9'}
          focus-within:outline-none focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0
        `.trim()}
      >
        {prefix && (
          <span
            className={`
              pl-3 flex items-center flex-shrink-0
              ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'}
            `.trim()}
          >
            {prefix}
          </span>
        )}
        <BaseInput
          ref={internalRef}
          value={value !== undefined ? value : inputValue}
          onChange={handleChange}
          className={`
            ${prefix ? 'pl-0' : ''}
            ${suffix || showClearIcon ? 'pr-0' : ''}
            border-0 ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none bg-transparent shadow-none
            ${finalClassName.replace(defaultInputClasses, '').replace(variantMap[variant], '')}
            flex-grow min-w-0
          `.trim()}
          disabled={disabled}
          {...props}
        />
        <span
          className={`
            flex items-center flex-shrink-0
            ${size === 'sm' ? 'pr-2' : size === 'lg' ? 'pr-3' : 'pr-2'}
            ${!(suffix || showClearIcon) ? 'hidden' : ''}
          `.trim()}
        >
          {showClearIcon && (
            <X
              data-testid="clear-button"
              className={`
                h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-600
                ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}
              `.trim()}
              onClick={handleClear}
            />
          )}
          {suffix && !showClearIcon && suffix}
          {suffix && showClearIcon && (
            <>
              <span className="mx-1 text-gray-300">|</span>
              {suffix}
            </>
          )}
        </span>
      </div>
    );
  },
);

Input.displayName = 'Input';
