import { useNavigate } from 'react-router-dom';

import { Dropdown } from '@eggshell/antd-ui';

import { useAuthStore } from '@/stores/zustand/auth.store';
import { logout } from '@/services';

import styles from './index.module.scss';

const userConfig = [
  {
    key: 'logout',
    label: '退出登录',
  },
];

function Logout() {
  const navigate = useNavigate();

  // 处理退出登录
  const handleLogout = async (/* selectedKeys: string[] */) => {
    // console.log('退出登录', selectedKeys);

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
  };

  return (
    <Dropdown menu={{ items: userConfig, onClick: handleLogout }} placement="bottom">
      <div className={styles.Logout}></div>
    </Dropdown>
  );
}
export default Logout;
