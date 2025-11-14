import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ProgramTypes, useAppContext } from '../context/AppContext';
import './HeaderBar.css';

const navItems = [
  { label: 'ダッシュボード', to: '/home' },
  { label: '学習分析', to: '/insights' },
  { label: '学習計画', to: '/planner' }
];

const HeaderBar = () => {
  const { profile, points, notifications, selectExperience } = useAppContext();
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const avatarInitial = profile.name ? profile.name[0] : '学';

  return (
    <header className="header-bar">
      <div className="header-bar__inner">
        <Link to="/home" className="header-bar__brand">
          <span className="header-bar__logo" aria-hidden="true">
            🎓
          </span>
          <span className="header-bar__title">BingGo for Study</span>
        </Link>
        <nav className="header-bar__nav" aria-label="トップナビゲーション">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `header-bar__nav-link ${isActive ? 'header-bar__nav-link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-bar__actions">
          <div className="header-bar__stat" aria-label="現在のBingGoポイント">
            <span className="header-bar__stat-label">ポイント</span>
            <span className="header-bar__stat-value">{points.current}</span>
          </div>
          <Link to="/bingo" className="header-bar__cta">
            ビンゴを開く
          </Link>
          <button
            type="button"
            className="header-bar__secondary"
            onClick={() => selectExperience(ProgramTypes.BINGGO, { preload: true })}
          >
            Bing Goへ
          </button>
          <Link to="/home#notifications" className="header-bar__icon-button" aria-label="通知">
            <span aria-hidden="true">🔔</span>
            {unreadCount > 0 && <span className="header-bar__badge">{unreadCount}</span>}
          </Link>
          <div className="header-bar__avatar" style={{ backgroundColor: profile.avatarColor }} aria-hidden="true">
            {avatarInitial}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
