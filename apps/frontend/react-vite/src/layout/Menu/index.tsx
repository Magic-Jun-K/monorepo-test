import { FC, memo, useMemo } from 'react';

import { Menu } from '@eggshell/antd-ui';

import { useUserStore } from '@/stores/zustand/user.store';
import { getMenuConfig, filterCustomProps } from './constant';

const MainMenu: FC = () => {
  const isAdmin = useUserStore((state) => state.isAdmin);

  const menuItems = useMemo(() => {
    const filteredConfig = getMenuConfig(isAdmin);
    return filterCustomProps(filteredConfig) || [];
  }, [isAdmin]);

  return (
    <nav>
      <Menu mode="horizontal" items={menuItems} style={{ border: 0 }} />
    </nav>
  );
};
export default memo(MainMenu);
