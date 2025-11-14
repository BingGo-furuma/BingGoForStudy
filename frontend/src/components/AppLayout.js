import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import HeaderBar from './HeaderBar';
import BingGoHeader from './BingGoHeader';
import BingGoBottomNav from './BingGoBottomNav';
import { useAppContext } from '../context/AppContext';
import './AppLayout.css';

const AppLayout = () => {
  const location = useLocation();
  const hideChrome = location.pathname === '/';
  const isBinggoRoute = location.pathname.startsWith('/binggo');
  const { experience } = useAppContext();

  return (
    <div className={`app-layout ${isBinggoRoute ? 'app-layout--binggo' : ''}`}>
      {!hideChrome && (isBinggoRoute ? <BingGoHeader /> : <HeaderBar experience={experience} />)}
      <div className="app-content">
        <Outlet />
      </div>
      {!hideChrome && (isBinggoRoute ? <BingGoBottomNav /> : <BottomNav />)}
    </div>
  );
};

export default AppLayout;
