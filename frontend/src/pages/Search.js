import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Search = () => {
  const { cards } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all');
  const [cardFilter, setCardFilter] = useState(params.get('card') || 'all');

  const taskPool = useMemo(() => {
    const items = [];
    cards.forEach((card) => {
      card.tasks.forEach((task) => {
        items.push({
          cardId: card.id,
          cardTitle: card.title,
          ...task
        });
      });
    });
    return items;
  }, [cards]);

  const categories = useMemo(() => {
    const set = new Set();
    taskPool.forEach((task) => set.add(task.category));
    return Array.from(set);
  }, [taskPool]);

  const difficulties = useMemo(() => {
    const set = new Set();
    taskPool.forEach((task) => set.add(task.difficulty));
    return Array.from(set);
  }, [taskPool]);

  const filteredTasks = useMemo(
    () =>
      taskPool.filter((task) => {
        if (cardFilter !== 'all' && task.cardId !== cardFilter) {
          return false;
        }
        if (category !== 'all' && task.category !== category) {
          return false;
        }
        if (difficulty !== 'all' && task.difficulty !== difficulty) {
          return false;
        }
        if (status === 'completed' && !task.isCompleted) {
          return false;
        }
        if (status === 'pending' && task.isCompleted) {
          return false;
        }
        if (query) {
          const keyword = query.toLowerCase();
          return (
            task.title.toLowerCase().includes(keyword) ||
            task.description.toLowerCase().includes(keyword) ||
            task.cardTitle.toLowerCase().includes(keyword)
          );
        }
        return true;
      }),
    [taskPool, cardFilter, category, difficulty, status, query]
  );

  return (
    <div className="dashboard-container">
      <section className="card">
        <h2>ミッション検索</h2>
        <p style={{ marginTop: 8, color: '#475569' }}>
          キーワードや分類でビンゴミッションを素早く探し、効率的に学習を進めましょう。
        </p>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <label style={{ gridColumn: '1 / -1' }}>
            キーワード
            <input
              type="search"
              placeholder="例）英語 文法"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            カード
            <select value={cardFilter} onChange={(event) => setCardFilter(event.target.value)}>
              <option value="all">すべて</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            分野
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">すべて</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            レベル
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option value="all">すべて</option>
              {difficulties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            ステータス
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">すべて</option>
              <option value="pending">未着手</option>
              <option value="completed">達成済み</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card" aria-labelledby="results-heading">
        <div className="section-title">
          <h3 id="results-heading">検索結果</h3>
          <span style={{ color: '#2563eb', fontWeight: 600 }}>{filteredTasks.length} 件</span>
        </div>
        {filteredTasks.length === 0 ? (
          <div className="empty-state">条件に合うミッションが見つかりませんでした。</div>
        ) : (
          <ul className="list-reset">
            {filteredTasks.map((task) => (
              <li key={`${task.cardId}-${task.id}`} className="list-item" style={{ display: 'grid', gap: '8px' }}>
                <div className="section-title">
                  <div>
                    <strong>
                      {task.cardTitle} #{task.id}
                    </strong>
                    <p style={{ margin: '4px 0', color: '#475569' }}>{task.title}</p>
                  </div>
                  <span style={{ color: task.isCompleted ? '#059669' : '#ef4444', fontWeight: 600 }}>
                    {task.isCompleted ? '達成済み' : '未達成'}
                  </span>
                </div>
                <p style={{ margin: '0 0 4px', color: '#64748b' }}>{task.description}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1d4ed8' }}>
                  分野: {task.category} ／ レベル: {task.difficulty} ／ 合格ライン:{' '}
                  {Math.round(task.passThreshold * 100)}%
                </p>
                {task.lastScore !== null && (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    最終正答率: {Math.round(task.lastScore * 100)}% ／ 挑戦回数: {task.attempts}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="primary-button" type="button" onClick={() => navigate(`/bingo/${task.cardId}`)}>
                    カードで開く
                  </button>
                  <button className="secondary-button" type="button" onClick={() => navigate(`/bingo/${task.cardId}`)}>
                    位置を確認
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Search;
