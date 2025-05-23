export interface MenuItemType {
  /** 菜单项类型，可选值：'group' */
  type?: 'group';
  /** 菜单项唯一标识 */
  key?: string; // 兼容 antd
  /** 菜单项显示内容 */
  label: React.ReactNode | JSX.Element;
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

export interface SubMenuType extends Omit<MenuItemType, 'type'> {
  type?: never;
  children: MenuType[];
}

export interface MenuItemGroupType extends Omit<MenuItemType, 'type'> {
  type: 'group';
  children: MenuType[];
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
  /** 默认选中项 */
  defaultSelectedKeys?: string[];
  /** 点击事件 */
  onClick?: (info: {
    key: string;
    keyPath: string[];
    item: any;
    domEvent: React.MouseEvent;
  }) => void;
  /** 选择事件 */
  onSelect?: (selectedKeys: string[]) => void;
}
