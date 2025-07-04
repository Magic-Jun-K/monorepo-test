import { useNavigate } from 'react-router-dom';
import { Dropdown, Menu, MenuItemType } from '@eggshell/unocss-ui';

import { logout } from '@/services';

import styles from './index.module.scss';
import './index.scss';

// 在检查前定义 menuConfig
const userConfig: MenuItemType[] = [
  {
    key: 'logout',
    label: '退出登录'
  }
];

function Logout() {
  const navigate = useNavigate();

  // 处理退出登录
  const handleLogout = async (/* selectedKeys: string[] */) => {
    // console.log('退出登录', selectedKeys);

    try {
      // 调用退出登录接口
      await logout();

      // 跳转到登录页
      navigate(`/account/login?redirect=${window.location.pathname}`);
    } catch (error) {
      console.error('退出登录失败:', error);
      navigate(`/account/login?redirect=${window.location.pathname}`);
    }
  };

  return (
    <Dropdown overlay={<Menu mode="vertical" items={userConfig} onSelect={handleLogout} />}>
      <div className={styles['logo']}></div>
    </Dropdown>
  );
}
export default Logout;
