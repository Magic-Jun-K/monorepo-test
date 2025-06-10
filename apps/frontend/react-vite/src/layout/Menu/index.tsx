import { FC, PropsWithChildren } from 'react';
import { Menu } from '@eggshell/unocss-ui';

import { MENU_CONFIG } from './constant';

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

const MainMenu: FC<PropsWithChildren<MenuProps>> = ({ items, className = '' }) => {
  console.log('Rendering menu items:', items);

  return (
    <nav className={`${styles['menu-component']} ${className}`}>
      <Menu mode="horizontal" items={MENU_CONFIG} />
    </nav>
  );
};
export default MainMenu;
