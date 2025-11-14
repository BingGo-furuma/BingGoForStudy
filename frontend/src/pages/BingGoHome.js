import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './BingGoHome.css';

const formatTime = (value) => {
  if (!value) {
    return '---';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
};

const BingGoHome = () => {
  const { profile, binggoCards, binggoMetrics, binggoActivity, binggoUpcoming } = useAppContext();
  const activeCard = useMemo(
    () => binggoCards.find((card) => card.id === binggoMetrics.activeCardId) || binggoCards[0],
    [binggoCards, binggoMetrics.activeCardId]
  );

  return (
    <div className="binggo-home">
      <section className="binggo-home__hero">
        <div>
          <h2>{binggoMetrics.monthlyLabel || '今月のBing Go'}</h2>
          <p>7×7のチャレンジで季節のミッションを制覇。証拠写真やメモを残しながら、仲間と進捗をシェアしましょう。</p>
          {activeCard && (
            <Link to={`/binggo/${activeCard.id}`} className="binggo-home__cta">
              カードを開く
            </Link>
          )}
        </div>
        <div className="binggo-home__summary">
          <div>
            <span>達成マス</span>
            <strong>
              {binggoMetrics.completed}/{binggoMetrics.total}
            </strong>
          </div>
          <div>
            <span>進捗率</span>
            <strong>{Math.round((binggoMetrics.progress || 0) * 100)}%</strong>
          </div>
          <div>
            <span>締め切り</span>
            <strong>{formatTime(binggoMetrics.nextDeadline)}</strong>
            {binggoMetrics.daysRemaining !== null && (
              <small>残り {binggoMetrics.daysRemaining} 日</small>
            )}
          </div>
          <div>
            <span>今月のポイント</span>
            <strong>{profile.binggoPoints}</strong>
          </div>
        </div>
      </section>

      <div className="binggo-home__grid">
        <section className="binggo-card">
          <header>
            <h3>次に挑戦するチャレンジ</h3>
            <p>未完了のタスクからおすすめをピックアップしました。</p>
          </header>
          <ol className="binggo-card__list">
            {binggoUpcoming.length > 0 ? (
              binggoUpcoming.map((task, index) => (
                <li key={task.id}>
                  <span className="binggo-card__index">#{task.id}</span>
                  <div>
                    <p className="binggo-card__title">{task.prompt || task.title}</p>
                    <small>推定 {task.recommendedMinutes || 20} 分</small>
                  </div>
                  {activeCard && (
                    <Link to={`/binggo/${activeCard.id}`} className="binggo-card__jump">
                      進む
                    </Link>
                  )}
                </li>
              ))
            ) : (
              <li className="binggo-card__empty">すべてのチャレンジを達成しました！</li>
            )}
          </ol>
        </section>

        <section className="binggo-card">
          <header>
            <h3>最新のアクティビティ</h3>
            <p>提出結果やポイント獲得の履歴です。</p>
          </header>
          <ul className="binggo-timeline">
            {binggoActivity.length > 0 ? (
              binggoActivity.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <p className={`binggo-timeline__status ${entry.isPassed ? 'is-passed' : ''}`}>
                      {entry.isPassed ? '達成！' : '挑戦中'}
                    </p>
                    <p className="binggo-timeline__title">{entry.title}</p>
                    <small>{new Date(entry.createdAt).toLocaleString('ja-JP')}</small>
                  </div>
                  <span className="binggo-timeline__score">{Math.round(entry.score)}%</span>
                </li>
              ))
            ) : (
              <li className="binggo-card__empty">まだチャレンジの履歴がありません。</li>
            )}
          </ul>
        </section>

        <section className="binggo-card">
          <header>
            <h3>月替わりカード一覧</h3>
            <p>今後挑戦できるカードの一覧です。</p>
          </header>
          <div className="binggo-card__grid">
            {binggoCards.map((card) => (
              <Link key={card.id} to={`/binggo/${card.id}`} className="binggo-card__tile">
                <span className="binggo-card__label">{card.monthlyLabel || card.title}</span>
                <strong>
                  {card.completedTiles}/{card.totalTiles} マス
                </strong>
                <small>
                  締切: {formatTime(card.periodEnd)}
                </small>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BingGoHome;
