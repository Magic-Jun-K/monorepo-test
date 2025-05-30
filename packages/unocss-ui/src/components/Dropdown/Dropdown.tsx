import { useState, useRef, useEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';

import type { DropdownProps } from './types';
import { DropdownContext } from './context';

import './dropdown.css';

export const Dropdown = ({
  children,
  overlay,
  trigger = 'hover',
  placement = 'bottom'
}: DropdownProps) => {
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const getPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    const rect = triggerRef.current.getBoundingClientRect();
    switch (placement) {
      case 'bottom':
        // 修改为居中对齐
        return {
          top: rect.bottom + 4,
          left: rect.left + rect.width / 2 - 60 // 假设下拉菜单宽度为120px，取一半
        };
      case 'top':
        // 同样修改为居中对齐
        return {
          top: rect.top - 4,
          left: rect.left + rect.width / 2 - 60
        };
      case 'left':
        return { top: rect.top, left: rect.left - 4 };
      case 'right':
        return { top: rect.top, left: rect.right + 4 };
      default:
        // 默认也使用居中对齐
        return {
          top: rect.bottom + 4,
          left: rect.left + rect.width / 2 - 60
        };
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    if (trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [trigger]);

  const triggerProps = {
    ...(trigger === 'hover' && {
      onMouseEnter: () => handleMouse(true),
      onMouseLeave: () => handleMouse(false)
    }),
    ...(trigger === 'click' && {
      onClick: () => setVisible(v => !v)
    })
  };

  // 添加关闭菜单方法
  const closeMenu = () => setVisible(false);

  // 修改鼠标事件处理逻辑
  const handleMouse = (shouldShow: boolean) => {
    if (trigger === 'hover') {
      // 添加延迟避免快速切换
      const timer = setTimeout(() => {
        setVisible(shouldShow);
        clearTimeout(timer);
      }, 150);
    }
  };

  return (
    <DropdownContext.Provider value={{ closeMenu }}>
      <div ref={wrapperRef} className="relative inline-block">
        {cloneElement(children, {
          ref: triggerRef,
          ...triggerProps
        })}
        {visible &&
          createPortal(
            <DropdownContext.Provider value={{ closeMenu }}>
              <div
                className="dropdown-popup absolute bg-white rounded-md shadow-lg z-1000 w-30 p-1"
                style={getPosition()}
                onMouseEnter={() => handleMouse(true)}
                // onMouseLeave={() => handleMouse(false)}
                onClick={e => e.stopPropagation()}
              >
                {overlay}
              </div>
            </DropdownContext.Provider>,
            document.body
          )}
      </div>
    </DropdownContext.Provider>
  );
};
