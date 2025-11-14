import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ProgramTypes, useAppContext } from '../context/AppContext';
import './BottomNav.css';

const navItems = [
  { label: 'ホーム', to: '/home', icon: '🏠' },
  { label: 'Bingo', to: '/bingo', icon: '🎯' },
  { label: '検索', to: '/search', icon: '🔍' },
  { label: 'Bing Go', to: '/binggo/home', icon: '🎉', program: ProgramTypes.BINGGO },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const { selectExperience } = useAppContext();

  const handleClick = (event, item) => {
    if (item.program === ProgramTypes.BINGGO) {
      event.preventDefault();
      selectExperience(ProgramTypes.BINGGO, { preload: true });
      navigate(item.to);
    }
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
          onClick={(event) => handleClick(event, item)}
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
