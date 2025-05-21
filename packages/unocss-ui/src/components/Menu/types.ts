export interface MenuItemType {
  /** 菜单项类型，可选值：'group' */
  type?: 'group';
  /** 菜单项唯一标识 */
  key?: string; // 兼容 antd
  itemKey?: string; // 兼容旧用法
  /** 菜单项显示内容 */
  label: React.ReactNode;
  /** 菜单项图标 */
  icon?: React.ReactNode;
  /** 是否禁用该菜单项 */
  disabled?: boolean;
  /** 是否为危险项（高亮警示） */
  danger?: boolean;
  /** 外链 */
  href?: string;
  /** 其他 antd 兼容属性 */
  [key: string]: any;
}

export interface SubMenuType extends MenuItemType {
  children: MenuItemType[];
}

export interface MenuItemGroupType extends MenuItemType {
  type: 'group';
  children: MenuItemType[];
}

export type MenuType = MenuItemType | SubMenuType | MenuItemGroupType;

export interface MenuProps {
  /** 菜单模式，可选值：'vertical' | 'horizontal'，默认为'vertical' */
  mode?: 'vertical' | 'horizontal';
  /** 菜单项数据列表 */
  items: MenuType[];
  /** 根节点样式 */
  style?: React.CSSProperties;
  /** 选中项 */
  selectedKeys?: string[];
  /** 点击事件 */
  onClick?: (info: {
    key: string;
    keyPath: string[];
    item: any;
    domEvent: React.MouseEvent;
  }) => void;
}
