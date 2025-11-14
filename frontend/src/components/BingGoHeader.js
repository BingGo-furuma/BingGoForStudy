import React from 'react';
import { Link } from 'react-router-dom';
import { ProgramTypes, useAppContext } from '../context/AppContext';
import './BingGoHeader.css';

const formatDate = (value) => {
  if (!value) {
    return '---';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
};

const BingGoHeader = () => {
  const { profile, binggoMetrics, selectExperience } = useAppContext();

  return (
    <header className="binggo-header">
      <div className="binggo-header__row">
        <div className="binggo-header__identity">
          <span className="binggo-header__logo" aria-hidden="true">
            🎉
          </span>
          <div>
            <h1>Bing Go</h1>
            <p>{binggoMetrics.monthlyLabel || '月間チャレンジ'}</p>
          </div>
        </div>
        <button
          type="button"
          className="binggo-header__switch"
          onClick={() => selectExperience(ProgramTypes.STUDY, { preload: true })}
        >
          学習モードへ
        </button>
      </div>
      <div className="binggo-header__stats" role="list">
        <div className="binggo-header__stat" role="listitem">
          <span>今月のポイント</span>
          <strong>{profile.binggoPoints}</strong>
        </div>
        <div className="binggo-header__stat" role="listitem">
          <span>進捗率</span>
          <strong>{Math.round((binggoMetrics.progress || 0) * 100)}%</strong>
          <small>
            {binggoMetrics.completed}/{binggoMetrics.total} マス
          </small>
        </div>
        <div className="binggo-header__stat" role="listitem">
          <span>締め切り</span>
          <strong>{formatDate(binggoMetrics.nextDeadline)}</strong>
          {binggoMetrics.daysRemaining !== null && (
            <small>残り {binggoMetrics.daysRemaining} 日</small>
          )}
        </div>
      </div>
      <div className="binggo-header__cta">
        <div className="binggo-header__user">
          <span className="binggo-header__avatar" aria-hidden="true">
            {profile.name ? profile.name[0] : 'B'}
          </span>
          <div>
            <p>{profile.name || 'ゲスト'}</p>
            <small>今月のチャレンジに挑戦中</small>
          </div>
        </div>
        {binggoMetrics.activeCardId && (
          <Link to={`/binggo/${binggoMetrics.activeCardId}`} className="binggo-header__button">
            カードを開く
          </Link>
        )}
      </div>
    </header>
  );
};

export default BingGoHeader;
