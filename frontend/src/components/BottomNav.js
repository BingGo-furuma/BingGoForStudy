import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
  { label: 'ホーム', to: '/home', icon: '🏠' },
  { label: 'BingGo', to: '/bingo', icon: '🎯' },
  { label: '検索', to: '/search', icon: '🔍' }
];

const BottomNav = () => (
  <nav className="bottom-nav">
    {navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
        }
      >
        <span className="bottom-nav__icon" aria-hidden="true">
          {item.icon}
        </span>
        <span className="bottom-nav__label">{item.label}</span>
      </NavLink>
    ))}
  </nav>
);

export default BottomNav;
