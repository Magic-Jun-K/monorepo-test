import type { ReactNode } from 'react';

export type MenuMode = 'vertical' | 'horizontal';
export type MenuTheme = 'light' | 'dark';

/**
 * 菜单上下文类型
 */
export interface MenuContextProps {
  prefixCls?: string;
  mode: MenuMode;
  theme?: MenuTheme;
  selectedKeys: string[];
  openKeys: string[];
  onSelect?: (key: string) => void;
  onOpenChange?: (keys: string[]) => void;
}

/**
 * 菜单项类型
 */
export interface MenuItemType {
  type: 'item' | 'group' | 'submenu';
  itemKey: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  children?: MenuItemType[];
  className?: string;
}

/**
 * 菜单类型
 */
export interface MenuProps {
  mode?: MenuMode;
  theme?: MenuTheme;
  items: MenuItemType[];
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  className?: string;
  style?: React.CSSProperties;
  onSelect?: (key: string) => void;
}

/**
 * 菜单组类型
 */
export interface MenuGroupProps {
  /**
   * 菜单项类型
   */
  type: 'group';
  /**
   * 分组标题
   */
  label: string;
  /**
   * 分组子项
   */
  children: MenuItemType[];
  /**
   * 唯一标识
   */
  itemKey: string;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 弹出菜单的样式
   */
  popupClassName?: string;
  /**
   * 弹出菜单的偏移量
   */
  popupOffset?: [number, number];
}

/**
 * 菜单项类型
 */
export interface MenuItemProps extends Omit<MenuItemType, 'type'> {
  type?: 'item';
}

/**
 * 子菜单类型
 */
export interface SubMenuProps extends Omit<MenuItemType, 'type' | 'children'> {
  type: 'submenu';
  children: ReactNode;
}

// 修改类型保护函数
export function isMenuItemType(obj: unknown): obj is MenuItemType {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    (
      (obj.type === 'item' && 'label' in obj) ||
      (obj.type === 'group' && 'label' in obj && 'children' in obj) ||
      (obj.type === 'submenu' && 'label' in obj && 'children' in obj)
    )
  );
} 