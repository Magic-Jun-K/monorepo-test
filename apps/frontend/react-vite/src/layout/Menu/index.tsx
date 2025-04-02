import { FC, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Menu } from '@eggshell/unocss-ui';
import type { MenuItemType } from '@eggshell/unocss-ui';

import styles from './index.module.scss';

interface LocalMenuItem {
  path: string;
  name: string;
  children?: LocalMenuItem[];
}

interface MenuProps {
  items: LocalMenuItem[];
  className?: string;
}

const menuConfig: MenuItemType[] = [
  {
    type: 'item',
    itemKey: 'dashboard',
    label: '仪表盘',
  },
  {
    type: 'submenu',
    itemKey: 'settings',
    label: '系统设置',
    children: [
      {
        type: 'item',
        itemKey: 'account',
        label: '账户管理'
      },
      {
        type: 'submenu',
        itemKey: 'security',
        label: '安全设置',
        children: [
          {
            type: 'item',
            itemKey: 'password',
            label: '密码修改'
          }
        ]
      }
    ]
  },
  {
    type: 'group',
    itemKey: 'help',
    label: '帮助中心',
    children: [
      {
        type: 'item',
        itemKey: 'help-docs',
        label: '文档中心'
      }
    ]
  }
];

const MainMenu: FC<PropsWithChildren<MenuProps>> = ({ items, className = '' }) => {
  console.log('Rendering menu items:', items);

  return (
    <nav className={`${styles['menu-component']} ${className}`}>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Link to={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>
      <Dropdown
        overlay={<Menu items={menuConfig} />}
      >
        <span>测试下拉菜单</span>
      </Dropdown>
    </nav>
  );
};
export default MainMenu;
