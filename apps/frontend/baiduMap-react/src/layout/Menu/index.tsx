import React from 'react';
import { Link } from 'react-router-dom';

import './index.scss';

interface MenuItem {
  path: string;
  name: string;
}

interface MenuProps {
  items: MenuItem[];
  className?: string;
}

const Menu: React.FC<MenuProps> = ({ items, className = '' }) => {
  return (
    <nav className={`menu-component ${className}`}>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Link to={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
export default Menu;
