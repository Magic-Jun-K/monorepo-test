/**
 * @file AutoComplete.tsx
 * @description 自动补全组件
 */
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Input } from '../Input'; // 引入Input组件

import type { AutoCompleteProps, SuggestionItem } from './types';

export const AutoComplete = ({
  value: propValue,
  defaultValue = '',
  options,
  onChange,
  onSelect,
  onSearch,
  debounce = 300,
  placeholder,
  disabled,
  allowClear = false,
  filterOption = true,
  defaultActiveFirstOption = true,
  labelKey = 'label',
  valueKey = 'value',
  style,
  open: propOpen
}: AutoCompleteProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  // 内部状态，用于控制下拉菜单是否显示
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  // 使用外部传入的open状态（如果提供），否则使用内部状态
  const isOpen = propOpen !== undefined ? propOpen : internalIsOpen;
  
  // 调试日志
  useEffect(() => {
    console.log('AutoComplete组件状态:', {
      propOpen,
      internalIsOpen,
      isOpen,
      suggestionsLength: suggestions.length
    });
  }, [propOpen, internalIsOpen, isOpen, suggestions.length]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 使用单一的值源，避免循环依赖
  const currentValue = propValue !== undefined ? propValue : internalValue;

  // 处理外部点击
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        // 只有在没有外部控制open状态时才更新内部状态
        if (propOpen === undefined) {
          setInternalIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [propOpen]);

  // 简化搜索逻辑 - 直接在useEffect中处理，避免useCallback导致的依赖问题
  useEffect(() => {
    if (disabled) {
      setSuggestions([]);
      setInternalIsOpen(false);
      setLoading(false);
      return;
    }

    // 调用onSearch回调
    if (onSearch) {
      onSearch(currentValue);
    }

    if (!currentValue?.trim()) {
      setSuggestions([]);
      setInternalIsOpen(false);
      setLoading(false);
      return;
    }

    const handler = setTimeout(() => {
      try {
        setLoading(true);
        // 只有在没有外部控制open状态时才更新内部状态
        if (propOpen === undefined) {
          setInternalIsOpen(true); // 在开始加载时就显示下拉菜单
        }
        let results: SuggestionItem[] = [];

        if (options && filterOption) {
          // 本地过滤
          results = options.filter(option => {
            const label = String(option[labelKey]).toLowerCase();
            return label.includes(currentValue.toLowerCase());
          });
        } else if (options) {
          // 不过滤，显示所有options
          results = options;
        }

        setSuggestions(results);
        // 只有在没有外部控制open状态时才更新内部状态
        if (propOpen === undefined) {
          setInternalIsOpen(true); // 总是显示下拉菜单，包括loading和空结果
        }
        setHighlightIndex(defaultActiveFirstOption && results.length > 0 ? 0 : -1);
      } catch (error) {
        console.error('搜索失败:', error);
        setSuggestions([]);
        // 只有在没有外部控制open状态时才更新内部状态
        if (propOpen === undefined) {
          setInternalIsOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, debounce);

    return () => clearTimeout(handler);
  }, [
    currentValue,
    debounce,
    disabled,
    onSearch,
    options,
    filterOption,
    labelKey,
    defaultActiveFirstOption
  ]);

  // 键盘导航
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) {
      // 当下拉菜单关闭时，某些按键可以打开菜单
      if ((e.key === 'ArrowDown' || e.key === 'Enter') && currentValue) {
        e.preventDefault();
        // 立即触发搜索，不等待防抖
        if (currentValue?.trim()) {
          // 再次触发useEffect
          // 只有在没有外部控制open状态时才更新内部状态
          if (propOpen === undefined) {
            setInternalIsOpen(true);
          }
        }
      }
      return;
    }

    switch (e.key) {
      case 'Tab':
      case 'Escape':
        // 只有在没有外部控制open状态时才更新内部状态
        if (propOpen === undefined) {
          setInternalIsOpen(false);
        }
        setHighlightIndex(-1);
        break;
      case 'Home':
        e.preventDefault();
        setHighlightIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightIndex(suggestions.length - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex >= suggestions.length ? 0 : nextIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => {
          const nextIndex = prev - 1;
          return nextIndex < 0 ? suggestions.length - 1 : nextIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && suggestions[highlightIndex]) {
          handleSelect(suggestions[highlightIndex]);
        } else {
          // 只有在没有外部控制open状态时才更新内部状态
          if (propOpen === undefined) {
            setInternalIsOpen(false);
          }
        }
        break;
    }
  };

  const handleSelect = (item: SuggestionItem) => {
    const selectedValue = item[valueKey] as string;

    if (propValue === undefined) {
      setInternalValue(selectedValue);
    }

    onChange?.(selectedValue);
    onSelect?.(item);
    // 只有在没有外部控制open状态时才更新内部状态
    if (propOpen === undefined) {
      setInternalIsOpen(false);
    }
    setHighlightIndex(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (propValue === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  const handleClear = () => {
    if (propValue === undefined) {
      setInternalValue('');
    }

    onChange?.('');
    setSuggestions([]);
    // 只有在没有外部控制open状态时才更新内部状态
    if (propOpen === undefined) {
      setInternalIsOpen(false);
    }
    setHighlightIndex(-1);
  };

  const handleFocus = () => {
    // onFocus时不立即搜索，依赖useEffect的防抖机制
  };

  const handleBlur = () => {
    // 延迟关闭，允许点击选项
    setTimeout(() => {
      // 只有在没有外部控制open状态时才更新内部状态
      if (propOpen === undefined) {
        setInternalIsOpen(false);
      }
      setHighlightIndex(-1);
    }, 200);
  };

  // 下拉菜单箭头图标
  const arrowIcon = (
    <div className="flex items-center">
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  return (
    <div ref={wrapperRef} className="relative" style={style}>
      <Input
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        allowClear={allowClear}
        onClear={handleClear}
        suffix={!currentValue && !loading ? arrowIcon : null}
      />

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : (
            <>
              {suggestions.map((item, index) => {
                const displayLabel = item[labelKey];
                return (
                  <div
                    key={`${String(item[valueKey])}-${index}`}
                    onClick={() => handleSelect(item)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      highlightIndex === index ? 'bg-blue-50' : ''
                    } truncate`}
                    title={String(displayLabel)}
                  >
                    {String(displayLabel)}
                  </div>
                );
              })}
              {suggestions.length === 0 && <div className="p-2 text-gray-500">No matches found</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
};