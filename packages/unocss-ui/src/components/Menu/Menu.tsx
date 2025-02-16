import { useState, createElement } from 'react';
import { clsx } from 'clsx';

import { MenuContext } from './context';
import { MenuItem } from './MenuItem';
import { SubMenu } from './SubMenu';
import type { MenuProps, MenuItemType, MenuItemProps, SubMenuProps } from './types';

import './menu.css';

export const Menu = ({
  mode = 'vertical',
  theme = 'light',
  items,
  selectedKeys: propSelectedKeys,
  defaultSelectedKeys = [],
  openKeys: propOpenKeys,
  defaultOpenKeys = [],
  className,
  style,
  onSelect,
}: MenuProps) => {
  const isControlled = propSelectedKeys !== undefined;
  const [internalSelectedKeys, setInternalSelectedKeys] = useState(defaultSelectedKeys);
  const [internalOpenKeys, setInternalOpenKeys] = useState(defaultOpenKeys);

  const selectedKeys = isControlled ? propSelectedKeys : internalSelectedKeys;
  const openKeys = propOpenKeys !== undefined ? propOpenKeys : internalOpenKeys;

  const handleSelect = (key: string) => {
    if (!isControlled) {
      setInternalSelectedKeys([key]);
    }
    onSelect?.(key);
  };

  const handleOpenChange = (keys: string[]) => {
    if (propOpenKeys === undefined) {
      setInternalOpenKeys(keys);
    }
  };

  const contextValue = {
    mode,
    theme,
    selectedKeys,
    openKeys,
    onSelect: handleSelect,
    onOpenChange: handleOpenChange,
  };

  const renderItem = (item: MenuItemType): JSX.Element => {
    const { type, children, ...safeProps } = item;
    
    const elementProps = {
      ...safeProps,
      key: safeProps.itemKey
    };

    if (type === 'submenu') {
      return createElement<SubMenuProps>(
        SubMenu,
        {
          ...elementProps,
          type: 'submenu',
          children: children?.map(renderItem)
        }
      );
    }

    if (type === 'group') {
      return createElement('div', {
        ...elementProps,
        children: (
          <>
            <div className="menu-group-title">{safeProps.label}</div>
            {children?.map(renderItem)}
          </>
        )
      });
    }

    return createElement<MenuItemProps>(
      MenuItem,
      {
        ...elementProps,
        itemKey: safeProps.itemKey,
        type: 'item',
        children: children?.map(renderItem)
      } as MenuItemProps
    );
  };

  return (
    <MenuContext.Provider value={contextValue}>
      <div
        className={clsx(
          'menu',
          `menu-${mode}`,
          `menu-${theme}`,
          className
        )}
        style={style}
      >
        {items.map(renderItem)}
      </div>
    </MenuContext.Provider>
  );
};

// const omit = <T extends object, K extends keyof T>(
//   obj: T,
//   keys: K[]
// ): Omit<T, K> => {
//   const clone = { ...obj };
//   keys.forEach(key => delete clone[key]);
//   return clone;
// }; 