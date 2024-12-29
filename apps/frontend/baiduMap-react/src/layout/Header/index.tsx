import React from 'react';

import Menu from '../Menu';

import './index.scss';

const menuItems = [
  { path: '/home', name: '首页' },
  { path: '/form-test', name: '表单测试页' },
  { path: '/baidu-map', name: '百度地图' },
];

export default () => {
  return (
    <div className="Header">
      <h1>测试系统</h1>
      <div className="Header-right">
        <div className="Header-right-menu">
          <Menu items={menuItems} />
        </div>
        <div className="logo"></div>
      </div>
    </div>
  );
};
