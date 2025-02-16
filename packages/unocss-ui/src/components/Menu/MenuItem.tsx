import { clsx } from 'clsx';

import { useMenuContext } from './context';
import type { MenuItemProps } from './types';

export const MenuItem = ({
  itemKey,
  label,
  icon,
  disabled,
  danger,
  className,
}: MenuItemProps) => {
  const { mode, selectedKeys, onSelect } = useMenuContext();
  
  const isSelected = selectedKeys.includes(itemKey);
  
  const handleClick = () => {
    if (!disabled) {
      onSelect?.(itemKey);
    }
  };

  return (
    <div
      className={clsx(
        'menu-item',
        `menu-item-${mode}`,
        {
          'menu-item-selected': isSelected,
          'menu-item-disabled': disabled,
          'menu-item-danger': danger,
        },
        className
      )}
      onClick={handleClick}
    >
      {icon && <span className="menu-item-icon">{icon}</span>}
      <span className="menu-item-text">{label}</span>
    </div>
  );
};