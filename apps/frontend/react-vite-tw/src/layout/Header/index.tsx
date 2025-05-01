import MenuCom from '../Menu';
import Logout from './Logout';

// import styles from './index.module.scss';

const menuItems = [
  { path: '/', name: '首页' },
  { path: '/form-test', name: '表单测试页' },
  { path: '/table-test', name: '表格测试页' },
  { path: '/baidu-map', name: '百度地图' }
];

function Header() {
  return (
    // <header className={styles['Header']}>
    //   <h1>Eggshell</h1>
    //   <div className={styles['Header-body']}>
    //     <MenuCom items={menuItems} />
    //   </div>
    //   <Logout />
    // </header>
    <header className="h-[68px] bg-[linear-gradient(189.16deg,#97abff_14%,#123597_98%)] flex items-center px-[4rem] shadow-[0px_8px_16px_rgba(0,0,0,0.1)] text-[#fff]">
      <h1 className="text-[2rem] font-bold pr-[1rem]">Eggshell</h1>
      <div className="flex-1 flex justify-between items-center">
        <MenuCom items={menuItems} />
      </div>
      <Logout />
    </header>
  );
}
export default Header;
