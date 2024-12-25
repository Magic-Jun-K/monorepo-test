import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from './Header';

import './index.scss';

export default () => {
  return (
    <>
      <Header />
      <div className="layout-body">
        <Outlet />
      </div>
    </>
  );
};
