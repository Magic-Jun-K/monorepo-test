import Menu from '../Menu';

import styles from './index.module.scss';

const menuItems = [
  { path: '/home', name: '首页' },
  { path: '/form-test', name: '表单测试页' },
  { path: '/baidu-map', name: '百度地图' }
];

export default () => {
  return (
    <div className={styles['Header']}>
      <h1>测试系统</h1>
      <div className={styles['Header-body']}>
        <div className={styles['Header-right-menu']}>
          <Menu items={menuItems} />
        </div>
        <div className={styles['logo']}></div>
      </div>
    </div>
  );
};
