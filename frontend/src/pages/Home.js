import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Home = () => {
  const { profile, points, cards, activities, updateProfile } = useAppContext();
  const [formState, setFormState] = useState({
    name: profile.name,
    grade: profile.grade,
    studySchedule: profile.studySchedule,
    paymentMethod: profile.paymentMethod,
    notes: profile.notes,
    goalSchools: profile.goalSchools.join('\n')
  });
  const [subjectInput, setSubjectInput] = useState(profile.preferredSubjects.join(', '));
  const [savedMessage, setSavedMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setFormState({
      name: profile.name,
      grade: profile.grade,
      studySchedule: profile.studySchedule,
      paymentMethod: profile.paymentMethod,
      notes: profile.notes,
      goalSchools: profile.goalSchools.join('\n')
    });
    setSubjectInput(profile.preferredSubjects.join(', '));
  }, [profile]);

  const progressByCard = useMemo(
    () =>
      cards.map((card) => {
        const completed = card.tasks.filter((task) => task.isCompleted).length;
        const total = card.tasks.length;
        const completionRate = total > 0 ? completed / total : 0;
        return {
          id: card.id,
          title: card.title,
          description: card.description,
          completed,
          total,
          completionRate,
          tags: card.tags
        };
      }),
    [cards]
  );

  const upcomingTasks = useMemo(() => {
    const queue = [];
    cards.forEach((card) => {
      card.tasks
        .filter((task) => !task.isCompleted)
        .slice(0, 5)
        .forEach((task) => {
          queue.push({
            cardId: card.id,
            cardTitle: card.title,
            taskId: task.id,
            title: task.title,
            category: task.category,
            difficulty: task.difficulty
          });
        });
    });
    return queue.slice(0, 6);
  }, [cards]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextGoalSchools = formState.goalSchools
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const nextSubjects = subjectInput
      .split(',')
      .map((subject) => subject.trim())
      .filter(Boolean);
    updateProfile({
      name: formState.name,
      grade: formState.grade,
      studySchedule: formState.studySchedule,
      paymentMethod: formState.paymentMethod,
      notes: formState.notes,
      goalSchools: nextGoalSchools,
      preferredSubjects: nextSubjects
    });
    setSavedMessage('プロフィールを更新しました');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  const avatarInitial = profile.name ? profile.name[0] : '学';

  return (
    <div className="dashboard-container">
      <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: profile.avatarColor,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 700
          }}
        >
          {avatarInitial}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{profile.name}</h2>
          <p style={{ margin: '4px 0', color: '#64748b' }}>{profile.grade}</p>
          <p style={{ margin: '4px 0', color: '#2563eb', fontWeight: 600 }}>
            志望校: {profile.goalSchools.join(' / ')}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="primary-button" type="button" onClick={() => navigate('/bingo')}>
            ビンゴカードを開く
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('/search')}>
            ミッション検索
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="card" aria-labelledby="points-heading">
          <h3 id="points-heading">ポイントと学習状況</h3>
          <div className="stat-grid">
            <div className="stat-tile">
              <span>現在のBingGoポイント</span>
              <strong>{points.current}</strong>
              <small>累計: {points.lifetime}</small>
            </div>
            <div className="stat-tile">
              <span>連続クリア日数</span>
              <strong>{points.streak}日</strong>
              <small>ビンゴ達成数: {points.bingoCount}</small>
            </div>
            <div className="stat-tile">
              <span>登録カード数</span>
              <strong>{cards.length}</strong>
              <small>進行中カードを確認しましょう</small>
            </div>
          </div>
          <ul className="list-reset" style={{ marginTop: 20 }}>
            {progressByCard.map((card) => (
              <li key={card.id} className="list-item">
                <div className="section-title">
                  <div>
                    <strong>{card.title}</strong>
                    <p style={{ margin: '4px 0', color: '#64748b' }}>{card.description}</p>
                  </div>
                  <span style={{ fontWeight: 700 }}>{Math.round(card.completionRate * 100)}%</span>
                </div>
                <div className="progress-bar" aria-hidden="true">
                  <div className="progress-bar__value" style={{ width: `${card.completionRate * 100}%` }} />
                </div>
                <p style={{ margin: '6px 0 0', color: '#475569' }}>
                  {card.completed} / {card.total} マス開放済み
                </p>
                <ul className="tag-list">
                  {card.tags.map((tag) => (
                    <li key={tag} className="tag">
                      #{tag}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <aside className="card" aria-labelledby="upcoming-heading">
          <h3 id="upcoming-heading">今日のおすすめ</h3>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state">すべてのマスを開放しました！新しいカードに挑戦しましょう。</div>
          ) : (
            <ul className="list-reset">
              {upcomingTasks.map((task) => (
                <li key={`${task.cardId}-${task.taskId}`} className="list-item">
                  <strong>
                    {task.cardTitle} #{task.taskId}
                  </strong>
                  <p style={{ margin: '4px 0', color: '#64748b' }}>{task.title}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#1d4ed8' }}>
                    {task.category} ／ {task.difficulty}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <section className="card" aria-labelledby="profile-heading">
        <div className="section-title">
          <h3 id="profile-heading">プロフィール・支払い情報</h3>
          {savedMessage && <span style={{ color: '#16a34a', fontWeight: 600 }}>{savedMessage}</span>}
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            お名前
            <input name="name" value={formState.name} onChange={handleChange} required />
          </label>
          <label>
            学年
            <select name="grade" value={formState.grade} onChange={handleChange}>
              <option value="高校1年">高校1年</option>
              <option value="高校2年">高校2年</option>
              <option value="高校3年">高校3年</option>
              <option value="既卒">既卒</option>
            </select>
          </label>
          <label>
            志望校（改行で複数入力）
            <textarea
              name="goalSchools"
              value={formState.goalSchools}
              onChange={handleChange}
              rows={3}
            />
          </label>
          <label>
            学習スケジュール
            <input name="studySchedule" value={formState.studySchedule} onChange={handleChange} />
          </label>
          <label>
            得意科目・重点科目（カンマ区切り）
            <input value={subjectInput} onChange={(event) => setSubjectInput(event.target.value)} />
          </label>
          <label>
            サブスク支払い方法
            <input name="paymentMethod" value={formState.paymentMethod} onChange={handleChange} />
          </label>
          <label>
            メモ
            <textarea name="notes" value={formState.notes} onChange={handleChange} rows={3} />
          </label>
          <button type="submit" className="primary-button">
            保存する
          </button>
        </form>
      </section>

      <section className="card" aria-labelledby="activity-heading">
        <h3 id="activity-heading">最近のアクティビティ</h3>
        <ul className="list-reset">
          {activities.map((activity) => (
            <li key={activity.id} className="list-item">
              <p style={{ margin: '0 0 4px' }}>{activity.message}</p>
              <span className="activity-timestamp">
                {new Date(activity.timestamp).toLocaleString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Home;
