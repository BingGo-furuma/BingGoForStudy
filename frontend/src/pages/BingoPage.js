import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const BingoPage = () => {
  const { cards } = useAppContext();
  const navigate = useNavigate();

  const cardsWithProgress = useMemo(
    () =>
      cards.map((card) => {
        const completed = card.tasks.filter((task) => task.isCompleted).length;
        const nextTask = card.tasks.find((task) => !task.isCompleted);
        const progress = Math.round((completed / card.tasks.length) * 100);
        return {
          id: card.id,
          title: card.title,
          description: card.description,
          tags: card.tags,
          progress,
          createdAt: card.createdAt,
          completed,
          total: card.tasks.length,
          nextTaskLabel: nextTask ? `次は #${nextTask.id} ${nextTask.title}` : '全マス開放済み！'
        };
      }),
    [cards]
  );

  return (
    <div className="dashboard-container">
      <section className="card">
        <div className="section-title">
          <h2>ビンゴカードを選択</h2>
          <p style={{ margin: 0, color: '#64748b' }}>興味のあるカードからチャレンジを開始しましょう。</p>
        </div>
        <ul className="list-reset">
          {cardsWithProgress.map((card) => (
            <li key={card.id} className="list-item" style={{ display: 'grid', gap: '12px' }}>
              <div className="section-title">
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{card.title}</strong>
                  <p style={{ margin: '4px 0', color: '#475569' }}>{card.description}</p>
                </div>
                <span style={{ fontWeight: 700 }}>{card.progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar__value" style={{ width: `${card.progress}%` }} />
              </div>
              <p style={{ margin: '6px 0 0', color: '#1d4ed8', fontWeight: 600 }}>{card.nextTaskLabel}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>登録日: {card.createdAt}</span>
                {card.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="primary-button" type="button" onClick={() => navigate(`/bingo/${card.id}`)}>
                  開始 / 続きを解く
                </button>
                <button className="secondary-button" type="button" onClick={() => navigate(`/search?card=${card.id}`)}>
                  ミッションを一覧表示
                </button>
              </div>
              <p style={{ margin: 0, color: '#475569' }}>
                完了数: {card.completed} / {card.total}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default BingoPage;
