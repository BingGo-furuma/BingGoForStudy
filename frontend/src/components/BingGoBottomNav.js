import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './BingGoBottomNav.css';

const BingGoBottomNav = () => {
  const { binggoMetrics } = useAppContext();
  const activeCardLink = binggoMetrics.activeCardId ? `/binggo/${binggoMetrics.activeCardId}` : '/binggo/home';
  const navItems = [
    { label: 'ホーム', to: '/binggo/home', icon: '🏡' },
    { label: 'カード', to: activeCardLink, icon: '🧩' },
    { label: '記録', to: '/binggo/archive', icon: '📜' },
  ];

  return (
    <nav className="binggo-bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `binggo-bottom-nav__item ${isActive ? 'binggo-bottom-nav__item--active' : ''}`
          }
        >
          <span className="binggo-bottom-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="binggo-bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BingGoBottomNav;
