export interface MenuItemType {
  /** 菜单项类型，可选值：'item' | 'submenu' | 'group' */
  type: 'item' | 'submenu' | 'group';
  /** 菜单项唯一标识 */
  itemKey: string;
  /** 菜单项显示内容 */
  label: React.ReactNode;
  /** 是否禁用该菜单项 */
  disabled?: boolean;
  /** 是否为危险项（高亮警示） */
  danger?: boolean;
  /** 子菜单项或分组子项 */
  children?: MenuItemType[];
}

export interface MenuProps {
  /** 菜单模式，可选值：'vertical' | 'horizontal'，默认为'vertical' */
  mode?: 'vertical' | 'horizontal';
  /** 菜单项数据列表 */
  items: MenuItemType[];
}
