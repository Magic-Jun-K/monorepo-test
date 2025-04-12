import { Outlet } from 'react-router-dom';

import Header from './Header';
import LayoutBody from './LayoutBody';

function Layout() {
  return (
    <>
      <Header />
      <LayoutBody>
        <Outlet />
      </LayoutBody>
    </>
  );
}
export default Layout;
