import React, { useState } from 'react';

import type { MenuItemType, MenuProps } from './types';
import './menu.css';

const MenuItem: React.FC<{ item: MenuItemType; mode: 'vertical' | 'horizontal' }> = ({
  item,
  mode
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const handleMouseEnter = () => {
    if (item.type === 'submenu') {
      setIsSubmenuOpen(true);
    }
  };
  const handleMouseLeave = () => {
    if (item.type === 'submenu') {
      setIsSubmenuOpen(false);
    }
  };
  if (item.type === 'item') {
    return (
      <li
        className={`menu-item ${item.disabled ? 'menu-item-disabled' : ''} ${
          item.danger ? 'menu-item-danger' : ''
        }`}
      >
        {item.label}
      </li>
    );
  } else if (item.type === 'submenu') {
    return (
      <li
        className={`menu-item submenu ${isSubmenuOpen ? 'submenu-open' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative' }}
      >
        <div className="submenu-title w-full">
          {item.label}
          <span className="submenu-arrow"></span>
        </div>
        {isSubmenuOpen && (
          <ul
            className="submenu-popup"
            // 'top-0 left-full'
            style={{
              top: 0,
              left: 'calc(100% + 8px)'
            }}
          >
            {item.children?.map(child => (
              <MenuItem key={child.itemKey} item={child} mode={mode} />
            ))}
          </ul>
        )}
      </li>
    );
  } else if (item.type === 'group') {
    return (
      <li className="menu-group">
        <div className="menu-group-title">{item.label}</div>
        <ul>
          {item.children?.map(child => (
            <MenuItem key={child.itemKey} item={child} mode={mode} />
          ))}
        </ul>
      </li>
    );
  }
  return null;
};

export const Menu: React.FC<MenuProps> = ({ mode = 'vertical', items }) => {
  return (
    <ul
      className={`menu ${mode === 'vertical' ? 'menu-vertical' : 'menu-horizontal'}`}
      style={{ position: 'relative' }}
    >
      {items.map(item => (
        <MenuItem key={item.itemKey} item={item} mode={mode} />
      ))}
    </ul>
  );
};
