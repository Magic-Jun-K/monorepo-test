import { memo, useCallback, useRef, useState, isValidElement } from 'react';
import type { FC, MouseEvent } from 'react';

import type { MenuType, MenuProps, MenuItemType, MenuItemGroupType } from './types';
import './menu.css';

function getItemKey(item: MenuType): string {
  return item.key || '';
}

const MenuItem: FC<{
  item: MenuType;
  mode: 'vertical' | 'horizontal';
  selectedKey?: string | undefined;
  onSelect?: ((key: string) => void) | undefined;
  onClick?: MenuProps['onClick'];
  openSubmenus: Set<string>;
  onSubmenuToggle: (key: string, isOpen: boolean) => void;
  onCloseAllSubmenus: () => void;
}> = memo(
  ({
    mode,
    item,
    selectedKey,
    onSelect,
    onClick,
    openSubmenus,
    onSubmenuToggle,
    onCloseAllSubmenus,
  }) => {
    const key = getItemKey(item);
    const isSubmenuOpen = openSubmenus.has(key);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const handleMouseEnter = useCallback(() => {
      if ('children' in item && !('type' in item && item.type === 'group')) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          onSubmenuToggle(key, true);
        }, 100); // 100ms 延迟
      }
    }, [item, key, onSubmenuToggle]);

    const handleMouseLeave = useCallback(() => {
      if ('children' in item && !('type' in item && item.type === 'group')) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          onSubmenuToggle(key, false);
        }, 300); // 300ms 延迟
      }
    }, [item, key, onSubmenuToggle]);

    const handleClick = (e: MouseEvent) => {
      if (!('children' in item) && !item.disabled) {
        // 检查是否包含Link组件，如果有则让Link处理导航
        const isLinkItem = isValidElement(item.label);

        if (isLinkItem) {
          // 如果是Link菜单项，直接触发Link的点击事件
          const linkElement = e.currentTarget.querySelector('a');
          if (linkElement) {
            linkElement.click();
          }
        } else {
          // 只有非Link菜单项才关闭子菜单和触发选择
          onCloseAllSubmenus();
          onSelect?.(key);
        }
        onClick?.({ key, keyPath: [key], item, domEvent: e });
      }
    };
    // 分组
    if ('type' in item && item.type === 'group') {
      const groupItem = item as MenuItemGroupType;
      return (
        <li className="menu-group">
          <div className="menu-group-title">{item.label}</div>
          <ul className="menu-group-list">
            {groupItem.children?.map((child: MenuType) => (
              <MenuItem
                key={getItemKey(child)}
                item={child}
                mode={mode}
                selectedKey={selectedKey}
                onSelect={onSelect}
                onClick={onClick}
                openSubmenus={openSubmenus}
                onSubmenuToggle={onSubmenuToggle}
                onCloseAllSubmenus={onCloseAllSubmenus}
              />
            ))}
          </ul>
        </li>
      );
    }
    // 子菜单
    if ('children' in item && Array.isArray(item.children)) {
      return (
        <li
          className={`menu-item submenu ${isSubmenuOpen ? 'submenu-open' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="submenu-title w-full">
            {item.icon && <span className="menu-item-icon mr-2">{item.icon}</span>}
            <span className="menu-item-label">{item.label}</span>
            <span className="submenu-arrow"></span>
          </div>
          {isSubmenuOpen && (
            <ul className="submenu-popup">
              {item.children.map((child: MenuType) => (
                <MenuItem
                  key={getItemKey(child)}
                  item={child}
                  mode={mode}
                  selectedKey={selectedKey}
                  onSelect={onSelect}
                  onClick={onClick}
                  openSubmenus={openSubmenus}
                  onSubmenuToggle={onSubmenuToggle}
                  onCloseAllSubmenus={onCloseAllSubmenus}
                />
              ))}
            </ul>
          )}
        </li>
      );
    }
    // 普通项
    if ('href' in item) {
      const menuItem = item as MenuItemType;
      return (
        <li
          className={`menu-item ${selectedKey === key ? 'menu-item-selected' : ''} ${
            menuItem.disabled ? 'menu-item-disabled' : ''
          } ${menuItem.danger ? 'menu-item-danger' : ''}`}
          style={mode === 'horizontal' ? { position: 'relative' } : {}}
        >
          <a
            href={menuItem.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-full h-full"
            tabIndex={menuItem.disabled ? -1 : 0}
            aria-disabled={item.disabled}
            onClick={(e) => item.disabled && e.preventDefault()}
          >
            {item.icon && <span className="menu-item-icon mr-2">{item.icon}</span>}
            <span className="menu-item-label">{item.label}</span>
          </a>
        </li>
      );
    }
    // 检查是否包含Link组件
    const isLinkItem = isValidElement(item.label);

    if (isLinkItem) {
      // 如果是Link菜单项，直接返回Link组件
      return item.label;
    }

    return (
      <button
        type="button"
        className={`menu-item${selectedKey === key ? ' menu-item-selected' : ''} ${
          item.disabled ? 'menu-item-disabled' : ''
        } ${item.danger ? 'menu-item-danger' : ''}`}
        onClick={handleClick}
        style={mode === 'horizontal' ? { position: 'relative' } : {}}
        disabled={item.disabled}
      >
        {item.icon && <span className="menu-item-icon mr-2">{item.icon}</span>}
        <span className="menu-item-label">{item.label}</span>
      </button>
    );
  },
);

export const Menu: FC<MenuProps> = ({
  items,
  mode = 'vertical',
  style,
  selectedKeys,
  defaultSelectedKeys = [],
  onClick,
  onSelect,
}) => {
  const isControlled = selectedKeys !== undefined;
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<string[]>(
    selectedKeys || defaultSelectedKeys,
  );
  const currentSelectedKeys = isControlled ? selectedKeys : internalSelectedKeys;
  const selectedKey = currentSelectedKeys?.[0];

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());

  const handleSelect = useCallback(
    (key: string) => {
      const newSelectedKeys = [key];

      if (!isControlled) {
        setInternalSelectedKeys(newSelectedKeys);
      }

      onSelect?.(newSelectedKeys);
    },
    [isControlled, onSelect],
  );

  const handleSubmenuToggle = useCallback((key: string, isOpen: boolean) => {
    setOpenSubmenus((prev) => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      return newSet;
    });
  }, []);

  const handleCloseAllSubmenus = useCallback(() => {
    setOpenSubmenus(new Set());
  }, []);

  return (
    <ul className={`menu menu-${mode}`} style={style}>
      {items.map((item) => (
        <MenuItem
          key={getItemKey(item)}
          item={item}
          mode={mode}
          selectedKey={selectedKey}
          onSelect={handleSelect}
          onClick={onClick}
          openSubmenus={openSubmenus}
          onSubmenuToggle={handleSubmenuToggle}
          onCloseAllSubmenus={handleCloseAllSubmenus}
        />
      ))}
    </ul>
  );
};
