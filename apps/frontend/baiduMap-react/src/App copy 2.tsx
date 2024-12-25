import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from './pages/Login';
import Layout from './layout';
import MapComponent from './pages/BMapGLCom';

import './App.scss';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route path="/home" element={<h1>Home</h1>} />
          <Route path="/baidu-map" element={<MapComponent />} />
        </Route>
      </Routes>
      {/* 添加一个默认路由 */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Router>
  );
};
export default App;
