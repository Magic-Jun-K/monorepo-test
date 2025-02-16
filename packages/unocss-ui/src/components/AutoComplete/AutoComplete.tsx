/**
 * @file AutoComplete.tsx
 * @description 自动补全组件
 */
import { useState, useEffect, useRef, KeyboardEvent } from 'react';

import type { AutoCompleteProps, SuggestionItem } from './types';

export const AutoComplete = ({
  value: propValue,
  defaultValue = '',
  options,
  fetchSuggestions,
  onChange,
  onSelect,
  debounce = 300,
  placeholder,
  disabled,
  allowClear = false,
  filterOption = true,
  defaultActiveFirstOption = true,
  labelKey = 'label',
  valueKey = 'value',
  renderItem,
  style
}: AutoCompleteProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(options || []);
  const value = propValue ?? internalValue;
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [displayInput, setDisplayInput] = useState('');

  // 处理外部点击
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 合并静态options和异步结果
  useEffect(() => {
    if (options) {
      setSuggestions(options);
    }
  }, [options]);

  // 添加初始化显示值的useEffect
  useEffect(() => {
    if (value && options) {
      const matchedOption = options.find(opt => opt[valueKey] === value);
      if (matchedOption) {
        setDisplayInput(matchedOption[labelKey] as string);
      }
    }
  }, [value, options, valueKey, labelKey]);

  // 修复过滤逻辑和下拉显示条件
  useEffect(() => {
    if (disabled || !value?.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        let results: SuggestionItem[] = [];
        
        if (options && filterOption) {
          // 优化本地过滤逻辑
          results = options.filter(option => {
            const label = String(option[labelKey]).toLowerCase();
            return label.includes(value.toLowerCase());
          });
        } else if (fetchSuggestions) {
          results = await fetchSuggestions(value) || [];
        }

        setSuggestions(results);
        setIsOpen(results.length > 0); // 根据结果数量控制下拉显示
        setHighlightIndex(defaultActiveFirstOption ? 0 : -1);
      } finally {
        setLoading(false);
      }
    }, debounce);

    return () => clearTimeout(handler);
  }, [value, debounce, disabled, fetchSuggestions, options, filterOption, labelKey, defaultActiveFirstOption]);

  // 键盘导航
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Tab':
        setIsOpen(false);
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
        setHighlightIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        if (highlightIndex >= 0 && suggestions[highlightIndex]) {
          handleSelect(suggestions[highlightIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (item: SuggestionItem) => {
    const selectedValue = item[valueKey] as string;
    const selectedLabel = item[labelKey] as string;
    onChange?.(selectedValue);
    setDisplayInput(selectedLabel);
    onSelect?.(item);
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    setDisplayInput(newValue);
  };

  const handleClear = () => {
    setInternalValue('');
    setSuggestions([]);
    setIsOpen(false);
    setDisplayInput('');
    onChange?.('');
  };

  // 添加onFocus处理逻辑
  const handleFocus = () => {
    if (value) {
      // 立即触发搜索
      handleSearchImmediately(value);
    }
  };

  // 立即搜索方法
  const handleSearchImmediately = async (input: string) => {
    if (disabled || !input.trim()) return;

    try {
      setLoading(true);
      let results: SuggestionItem[] = [];
      
      if (options && filterOption) {
        results = options.filter(option => {
          const label = String(option[labelKey]).toLowerCase();
          return label.includes(input.toLowerCase());
        });
      } else if (fetchSuggestions) {
        results = await fetchSuggestions(input) || [];
      }

      setSuggestions(results);
      setIsOpen(results.length > 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative" style={style}>
      <div className="flex items-center gap-1 relative">
        <input
          value={displayInput || (options?.find(opt => opt[valueKey] === value)?.[labelKey] as string) || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {allowClear && value && (
          <button 
            onClick={handleClear} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
          >
            ✕
          </button>
        )}
      </div>

      {/* 下拉菜单增加箭头图标 */}
      {!value && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-0">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}

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
                    key={String(item[valueKey])}
                    onClick={() => handleSelect(item)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                      highlightIndex === index ? 'bg-blue-50' : ''
                    }`}
                  >
                    {renderItem ? renderItem(item) : String(displayLabel)}
                  </div>
                );
              })}
              {!suggestions.length && (
                <div className="p-2 text-gray-500">No matches found</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}; 