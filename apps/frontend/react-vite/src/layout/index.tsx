import { Outlet } from 'react-router-dom';

import Header from './Header';
import LayoutBody from './LayoutBody';
// import Footer from './Footer';

function Layout() {
  return (
    <>
      <Header />
      <LayoutBody>
        <Outlet />
        {/* <Footer /> */}
      </LayoutBody>
    </>
  );
}
export default Layout;
