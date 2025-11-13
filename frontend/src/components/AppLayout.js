import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import './AppLayout.css';

const AppLayout = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/';

  return (
    <div className="app-layout">
      <div className="app-content">
        <Outlet />
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
