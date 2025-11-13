import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ChallengeModal from '../components/ChallengeModal';

const formatPercentage = (value) => `${Math.round(value * 100)}%`;

const BingoBoardPage = () => {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const { cards, completeChallenge } = useAppContext();
  const card = cards.find((item) => item.id === cardId);
  const [selectedTask, setSelectedTask] = useState(() => card?.tasks?.[0] || null);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    if (!card) {
      return;
    }
    if (selectedTask) {
      const updated = card.tasks.find((task) => task.id === selectedTask.id);
      if (updated && updated !== selectedTask) {
        setSelectedTask(updated);
      }
    } else if (card.tasks.length > 0) {
      setSelectedTask(card.tasks[0]);
    }
  }, [card, selectedTask]);

  const summary = useMemo(() => {
    if (!card) {
      return { completed: 0, total: 0, progress: 0 };
    }
    const completed = card.tasks.filter((task) => task.isCompleted).length;
    const total = card.tasks.length;
    const progress = total > 0 ? completed / total : 0;
    return { completed, total, progress };
  }, [card]);

  if (!card) {
    return (
      <div className="dashboard-container">
        <section className="card">
          <h2>カードが見つかりません</h2>
          <p>URL を確認するか、カード一覧から再度アクセスしてください。</p>
          <button className="primary-button" type="button" onClick={() => navigate('/bingo')}>
            カード一覧へ戻る
          </button>
        </section>
      </div>
    );
  }

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    if (!task.isCompleted) {
      setActiveTask(task);
    }
  };

  const handleChallenge = (task) => {
    setSelectedTask(task);
    setActiveTask(task);
  };

  const handleModalSubmit = async (task, responses) => {
    const evaluation = await completeChallenge({
      cardId: card.id,
      taskId: task.id,
      responses,
    });
    return evaluation;
  };

  const closeModal = () => setActiveTask(null);

  return (
    <div className="dashboard-container">
      <section className="card">
        <div className="section-title">
          <div>
            <h2 style={{ margin: 0 }}>{card.title}</h2>
            <p style={{ margin: '6px 0', color: '#475569' }}>{card.description}</p>
            <ul className="tag-list">
              {card.tags.map((tag) => (
                <li key={tag} className="tag">
                  #{tag}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#6366f1', fontWeight: 700 }}>{formatPercentage(summary.progress)} 完了</p>
            <p style={{ margin: '4px 0 0', color: '#64748b' }}>
              {summary.completed} / {summary.total} マス開放
            </p>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="card">
          <div className="section-title">
            <h3 style={{ margin: 0 }}>ビンゴボード</h3>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>ビンゴ達成: {card.completedLines.length}</span>
          </div>
          <div className="bingo-grid" role="grid" aria-label={`${card.title} のビンゴボード`}>
            {card.tasks.map((task) => {
              const classNames = ['bingo-cell'];
              if (task.isCompleted) {
                classNames.push('bingo-cell--completed');
              }
              if (selectedTask?.id === task.id) {
                classNames.push('bingo-cell--active');
              }
              return (
                <button
                  key={task.id}
                  type="button"
                  className={classNames.join(' ')}
                  onClick={() => handleSelectTask(task)}
                >
                  <span style={{ fontSize: '1.2rem' }}>#{task.id}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', marginTop: 6 }}>{task.category}</span>
                  {task.isCompleted && (
                    <span style={{ fontSize: '0.7rem', marginTop: 6, display: 'block' }}>
                      最終正答率 {task.lastScore !== null ? formatPercentage(task.lastScore) : '-'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="card">
          <h3 style={{ marginTop: 0 }}>チャレンジ詳細</h3>
          {selectedTask ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <strong>
                  #{selectedTask.id} {selectedTask.title}
                </strong>
                <p style={{ margin: '6px 0', color: '#475569' }}>{selectedTask.description}</p>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#1d4ed8' }}>
                分野: {selectedTask.category} ／ レベル: {selectedTask.difficulty}
              </p>
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <div className="stat-tile" style={{ padding: 12 }}>
                  <span>合格ライン</span>
                  <strong>{formatPercentage(selectedTask.passThreshold)}</strong>
                </div>
                <div className="stat-tile" style={{ padding: 12 }}>
                  <span>これまでの正答率</span>
                  <strong>
                    {selectedTask.lastScore !== null ? formatPercentage(selectedTask.lastScore) : '---'}
                  </strong>
                </div>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                挑戦回数: {selectedTask.attempts}
              </p>
              <div>
                <h4 style={{ marginBottom: 8 }}>推奨リソース</h4>
                {selectedTask.resources.length > 0 ? (
                  <ul className="list-reset">
                    {selectedTask.resources.map((resource) => (
                      <li key={resource.id} className="list-item" style={{ padding: '8px 12px' }}>
                        {resource.url ? (
                          <a href={resource.url} target="_blank" rel="noreferrer">
                            {resource.label}
                          </a>
                        ) : (
                          <span>{resource.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, color: '#94a3b8' }}>おすすめタグは現在ありません。</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="primary-button" type="button" onClick={() => handleChallenge(selectedTask)}>
                  {selectedTask.isCompleted ? '復習する' : 'チャレンジを開始'}
                </button>
                <button className="secondary-button" type="button" onClick={() => navigate('/bingo')}>
                  カード一覧へ戻る
                </button>
              </div>
            </div>
          ) : (
            <p>マスを選択すると詳細が表示されます。</p>
          )}
        </aside>
      </div>

      <section className="card" aria-labelledby="rules-heading">
        <h3 id="rules-heading">カードの遊び方</h3>
        <ul className="list-reset">
          <li className="list-item">
            <strong>1. マスを選択</strong>
            <p style={{ margin: '6px 0 0' }}>興味のあるマスを選び、設問に回答します。</p>
          </li>
          <li className="list-item">
            <strong>2. 正答率 {formatPercentage(selectedTask?.passThreshold ?? 0.7)} 以上で合格</strong>
            <p style={{ margin: '6px 0 0' }}>複数の選択問題に回答すると正答率が表示されます。</p>
          </li>
          <li className="list-item">
            <strong>3. ビンゴラインでボーナス獲得</strong>
            <p style={{ margin: '6px 0 0' }}>縦・横・斜めのラインを揃えるとボーナスポイントが加算されます。</p>
          </li>
        </ul>
      </section>

      {activeTask && (
        <ChallengeModal task={activeTask} onClose={closeModal} onSubmit={handleModalSubmit} />
      )}
    </div>
  );
};

export default BingoBoardPage;
