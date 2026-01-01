import MenuCom from '../Menu';
import Logout from './Logout';

import styles from './index.module.scss';

function Header() {
  return (
    <header className={styles['Header']}>
      <h1>Eggshell</h1>
      <div className={styles['Header-body']}>
        <MenuCom />
      </div>
      <Logout />
    </header>
  );
}
export default Header;
