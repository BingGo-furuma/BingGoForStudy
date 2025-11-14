import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './BingGoArchive.css';

const BingGoArchive = () => {
  const { binggoCards, binggoActivity } = useAppContext();
  const pastCards = useMemo(
    () => binggoCards.filter((card) => !card.isActive).sort((a, b) => new Date(b.periodEnd) - new Date(a.periodEnd)),
    [binggoCards]
  );

  return (
    <div className="binggo-archive">
      <section className="binggo-archive__panel">
        <h2>最近の達成ログ</h2>
        <p>達成済みチャレンジとスコアを振り返りましょう。</p>
        <ul className="binggo-archive__timeline">
          {binggoActivity.length > 0 ? (
            binggoActivity.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{entry.title}</strong>
                  <small>{new Date(entry.createdAt).toLocaleString('ja-JP')}</small>
                </div>
                <span className={`binggo-archive__badge ${entry.isPassed ? 'is-success' : ''}`}>
                  {Math.round(entry.score)}%
                </span>
              </li>
            ))
          ) : (
            <li className="binggo-archive__empty">まだ達成ログがありません。</li>
          )}
        </ul>
      </section>

      <section className="binggo-archive__panel">
        <h2>月間カードアーカイブ</h2>
        <p>過去のカードにもいつでもアクセスできます。</p>
        <div className="binggo-archive__cards">
          {pastCards.length > 0 ? (
            pastCards.map((card) => (
              <Link key={card.id} to={`/binggo/${card.id}`} className="binggo-archive__card">
                <span className="binggo-archive__label">{card.monthlyLabel || card.title}</span>
                <strong>
                  {card.completedTiles}/{card.totalTiles} マス達成
                </strong>
                <small>締切: {card.periodEnd}</small>
              </Link>
            ))
          ) : (
            <p className="binggo-archive__empty">過去のカードはまだありません。</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default BingGoArchive;
