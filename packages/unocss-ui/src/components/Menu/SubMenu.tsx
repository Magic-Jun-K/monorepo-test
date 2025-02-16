import { useState, useCallback, ReactNode, Children, isValidElement, cloneElement, ReactElement } from 'react';
import { clsx } from 'clsx';

import { useMenuContext } from './context';
// import { MenuItem } from './MenuItem';
import type { MenuItemType } from './types';

type SubMenuProps = Omit<MenuItemType, 'type' | 'children'> & {
  type: 'submenu';
  itemKey: string;
  label: ReactNode;
  children: ReactNode;
  className?: string;
};

export const SubMenu = ({
  itemKey,
  label,
  children,
  className,
}: SubMenuProps) => {
  const { mode, openKeys, onOpenChange } = useMenuContext();
  const [isOpen, setIsOpen] = useState(openKeys.includes(itemKey));
  
  const toggleOpen = useCallback(() => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    onOpenChange?.(newOpen ? [...openKeys, itemKey] : openKeys.filter(k => k !== itemKey));
  }, [isOpen, openKeys, onOpenChange, itemKey]);

  return (
    <div className={clsx('submenu', className)}>
      <div
        className={clsx(
          'submenu-title',
          `submenu-title-${mode}`,
          { 'submenu-open': isOpen }
        )}
        onClick={toggleOpen}
      >
        <span className="submenu-label">{label}</span>
        <span className="submenu-arrow" />
      </div>
      {isOpen && (
        <div className={clsx('submenu-content', `submenu-content-${mode}`)}>
          {Children.map(children, child => 
            isValidElement(child) ? 
            cloneElement(child as ReactElement<MenuItemType>, { type: 'item' }) : 
            child
          )}
        </div>
      )}
    </div>
  );
}; 