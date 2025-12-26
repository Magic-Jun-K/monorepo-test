import { FC, useEffect, useState } from 'react';

import { Menu } from '@eggshell/antd-ui';
import type { MenuProps } from '@eggshell/antd-ui';

import { useUserStore } from '@/store/zustand/user.store';
import { getMenuConfig } from './constant';

// 过滤掉自定义属性的函数
const filterCustomProps = (items: unknown[]): unknown[] => {
  return items.map((item: unknown) => {
    const itemObj = item as Record<string, unknown>;
    // 创建一个不包含自定义属性的新对象
    const filteredItem: Record<string, unknown> = { ...itemObj };
    delete filteredItem.requireAdmin;
    delete filteredItem.component;

    // 如果有子菜单，递归处理子菜单
    if (filteredItem.children) {
      filteredItem.children = filterCustomProps(filteredItem.children as unknown[]);
    }

    return filteredItem;
  });
};

const MainMenu: FC = () => {
  // 默认不显示任何需要权限的菜单项，等获取到用户信息后再根据权限显示
  const [menuConfig, setMenuConfig] = useState<MenuProps['items']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.warn('updateMenuBasedOnUser 获取userStore信息:', useUserStore.getState().getIsAdmin());

    // 根据用户角色过滤菜单
    const isAdmin = useUserStore.getState().getIsAdmin();
    console.warn('最终是否是管理员:', isAdmin);

    const userType = isAdmin ? 'admin' : 'user';
    console.warn('用户类型字符串:', userType);

    const filteredConfig = getMenuConfig(userType);
    console.warn('过滤后的菜单配置:', filteredConfig);

    // 过滤掉自定义属性后再设置状态
    const antdCompatibleConfig = filterCustomProps(filteredConfig);
    setMenuConfig(antdCompatibleConfig as MenuProps['items']);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <nav>
        <div style={{ padding: '0 24px', lineHeight: '64px' }}>加载中...</div>
      </nav>
    );
  }

  console.warn('Rendering menu items:', menuConfig);

  return (
    <nav>
      <Menu mode="horizontal" items={menuConfig || []} style={{ border: 0 }} />
    </nav>
  );
};
export default MainMenu;
