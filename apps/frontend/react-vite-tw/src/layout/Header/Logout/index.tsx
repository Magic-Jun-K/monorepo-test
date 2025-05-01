import { useNavigate } from 'react-router-dom';
import { Dropdown, Menu, MenuItemType } from '@eggshell/unocss-ui';

import { authStore } from '../../../store/auth.store';

// 在检查前定义 menuConfig
const userConfig: MenuItemType[] = [
  {
    type: 'item',
    itemKey: 'logout',
    label: '退出登录'
  }
];

function Logout() {
  const navigate = useNavigate();

  // 处理退出登录
  const handleLogout = (key: string) => {
    console.log('退出登录', key);

    // 清除 token
    authStore.clear();

    // 跳转到登录页
    navigate(`/account/login?redirect=${window.location.pathname}`);
  };

  return (
    <Dropdown overlay={<Menu mode="vertical" items={userConfig} onSelect={handleLogout} />}>
      <div className="w-[36px] h-[36px] rounded-[50%] bg-[#fff] shadow-[0_2px_8px_rgba(0,0,0,0.1)]"></div>
    </Dropdown>
  );
}
export default Logout;
