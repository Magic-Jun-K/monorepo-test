import { useState, useRef, useEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';

import type { DropdownProps } from './types';
import { DropdownContext } from './context';

export const Dropdown = ({ children, overlay, trigger = 'hover', placement = 'bottom' }: DropdownProps) => {
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const getPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    const rect = triggerRef.current.getBoundingClientRect();
    switch (placement) {
      case 'bottom':
        return { top: rect.bottom + 4, left: rect.left };
      case 'top':
        return { top: rect.top - 4, left: rect.left };
      case 'left':
        return { top: rect.top, left: rect.left - 4 };
      case 'right':
        return { top: rect.top, left: rect.right + 4 };
      default:
        return { top: rect.bottom + 4, left: rect.left };
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
                className="absolute bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px] py-1"
                style={getPosition()}
                onMouseEnter={() => handleMouse(true)}
                onMouseLeave={() => handleMouse(false)}
                onClick={(e) => e.stopPropagation()}
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