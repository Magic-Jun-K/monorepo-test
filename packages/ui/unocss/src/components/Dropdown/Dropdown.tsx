import { useState, useRef, useEffect, useLayoutEffect, cloneElement, useCallback } from 'react';
import { createPortal } from 'react-dom';

import type { DropdownProps } from './types';
import { DropdownContext } from './context';

import './dropdown.css';

export const Dropdown = ({
  children,
  overlay,
  trigger = 'hover',
  placement = 'bottom',
}: DropdownProps) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  const getPosition = useCallback(() => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    const rect = triggerRef.current.getBoundingClientRect();
    switch (placement) {
      case 'bottom':
        return {
          top: rect.bottom + 4,
          left: rect.left + rect.width / 2 - 60,
        };
      case 'top':
        return {
          top: rect.top - 4,
          left: rect.left + rect.width / 2 - 60,
        };
      case 'left':
        return { top: rect.top, left: rect.left - 4 };
      case 'right':
        return { top: rect.top, left: rect.right + 4 };
      default:
        return {
          top: rect.bottom + 4,
          left: rect.left + rect.width / 2 - 60,
        };
    }
  }, [placement]);

  useLayoutEffect(() => {
    if (visible && triggerRef.current) {
      window.requestAnimationFrame(() => {
        setPosition(getPosition());
      });
    }
  }, [visible, placement, getPosition]);

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
      onMouseLeave: () => handleMouse(false),
    }),
    ...(trigger === 'click' && {
      onClick: () => setVisible((v) => !v),
    }),
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
          ...triggerProps,
        })}
        {visible &&
          createPortal(
            <DropdownContext.Provider value={{ closeMenu }}>
              <button
                type="button"
                className="dropdown-popup absolute bg-white rounded-md shadow-lg z-1000 w-30 p-1 text-left"
                style={position}
                onMouseEnter={() => handleMouse(true)}
                onMouseLeave={() => handleMouse(false)}
                onClick={(e) => e.stopPropagation()}
              >
                {overlay}
              </button>
            </DropdownContext.Provider>,
            document.body,
          )}
      </div>
    </DropdownContext.Provider>
  );
};
