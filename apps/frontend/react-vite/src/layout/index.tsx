import { Outlet } from 'react-router-dom';

import Header from './Header';
import LayoutBody from './LayoutBody';
// import Footer from './Footer';

function Layout() {
  return (
    <>
      <Header />
      <LayoutBody>
        {/* @ts-error Outlet 组件类型定义不兼容本用法 */}
        <Outlet />
        {/* <Footer /> */}
      </LayoutBody>
    </>
  );
}
export default Layout;
