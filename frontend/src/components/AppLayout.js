import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import HeaderBar from './HeaderBar';
import './AppLayout.css';

const AppLayout = () => {
  const location = useLocation();
  const hideChrome = location.pathname === '/';

  return (
    <div className="app-layout">
      {!hideChrome && <HeaderBar />}
      <div className="app-content">
        <Outlet />
      </div>
      {!hideChrome && <BottomNav />}
    </div>
  );
};

export default AppLayout;
