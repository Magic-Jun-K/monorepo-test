import { useNavigate } from 'react-router-dom';

import { Dropdown } from '@eggshell/ui-antd';
import type { MenuProps } from '@eggshell/ui-antd';

import { useAuthStore } from '@/stores/zustand/auth.store';
import { logout } from '@/services';

// 在检查前定义 menuConfig
const userConfig: MenuProps['items'] = [
  {
    key: 'userInfo',
    label: '个人中心',
  },
  {
    key: 'logout',
    label: '退出登录',
  },
];

export default () => {
  const navigate = useNavigate();

  // 处理菜单点击
  const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === 'userInfo') {
      navigate('/user/profile');
      return;
    }

    if (key === 'logout') {
      try {
        // 调用退出登录接口
        await logout();

        // 清除本地 token
        useAuthStore.getState().clear();

        // 跳转到登录页
        navigate(`/account/login?redirect=${window.location.pathname}`);
      } catch (error) {
        console.error('退出登录失败:', error);
        // 即使接口调用失败，也清除本地状态并跳转
        useAuthStore.getState().clear();
        navigate(`/account/login?redirect=${window.location.pathname}`);
      }
    }
  };

  return (
    <Dropdown menu={{ items: userConfig, onClick: handleMenuClick }} placement="bottom">
      <div className="w-9 h-9 rounded-full bg-black shadow-sm cursor-pointer"></div>
    </Dropdown>
  );
};
