import MenuCom from '../Menu';
import Logout from './Logout';

import styles from './index.module.scss';

const menuItems = [
  { path: '/', name: '首页' },
  { path: '/form-test', name: '表单测试页' },
  { path: '/table-test', name: '表格测试页' },
  { path: '/baidu-map', name: '百度地图' }
];

function Header() {
  return (
    <div className={styles['Header']}>
      <h1>Eggshell</h1>
      <div className={styles['Header-body']}>
        <div className={styles['Header-right-menu']}>
          <MenuCom items={menuItems} />
        </div>
        <Logout />
      </div>
    </div>
  );
}
export default Header;
