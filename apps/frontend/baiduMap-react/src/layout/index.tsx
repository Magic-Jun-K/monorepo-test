import { Outlet } from 'react-router-dom';

import Header from './Header';
import LayoutBody from './LayoutBody';

export default () => {
  return (
    <>
      <Header />
      <LayoutBody>
        <Outlet />
      </LayoutBody>
    </>
  );
};
