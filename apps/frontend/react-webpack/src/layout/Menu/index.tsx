import { FC } from 'react';
// import { Link } from 'react-router-dom';
import { Menu } from '@eggshell/unocss-ui';

import { /* MENU_CONFIG, */ TEST_MENU_CONFIG } from './constant';

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

const MainMenu: FC<MenuProps> = ({ items, className = '' }) => {
  console.log('Rendering menu items:', items);

  return (
    // <ul className={styles["menu-component-ul"]}>
    //   {items.map((item, index) => (
    //     <li key={index}>
    //       {/* @ts-expect-error Link 组件类型定义不兼容本用法 */}
    //       <Link to={item.path}>{item.name}</Link>
    //     </li>
    //   ))}
    // </ul>
    <nav className={`${styles['menu-component']} ${className}`}>
      <Menu mode="horizontal" items={TEST_MENU_CONFIG} />
    </nav>
  );
};
export default MainMenu;
