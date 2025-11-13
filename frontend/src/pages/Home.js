import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const formatDateLabel = (isoString) =>
  new Date(isoString).toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  });

const formatTimeRange = (startAt, durationMinutes) => {
  const start = new Date(startAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const formatter = new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${formatter.format(start)}〜${formatter.format(end)}`;
};

const Home = () => {
  const {
    profile,
    points,
    cards,
    activities,
    updateProfile,
    studyPlan,
    togglePlanTask,
    achievements,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    resources,
    coachingTips,
    insights
  } = useAppContext();
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
        .slice(0, 4)
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

  const sortedPlan = useMemo(
    () =>
      [...studyPlan].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [studyPlan]
  );

  const upcomingSessions = useMemo(() => sortedPlan.slice(0, 4), [sortedPlan]);

  const unlockedAchievements = useMemo(
    () => achievements.filter((achievement) => achievement.isUnlocked),
    [achievements]
  );

  const lockedAchievements = useMemo(
    () => achievements.filter((achievement) => !achievement.isUnlocked),
    [achievements]
  );

  const topSubjects = useMemo(() => {
    const sorted = [...insights.subjectPerformance].sort((a, b) => b.accuracy - a.accuracy);
    return sorted.slice(0, 3);
  }, [insights.subjectPerformance]);

  const weeklyMax = useMemo(
    () => Math.max(1, ...insights.weeklyActivity.map((entry) => entry.completions)),
    [insights.weeklyActivity]
  );

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
  const nextSession = upcomingSessions[0];
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  return (
    <div className="dashboard-container">
      <section className="card home-hero">
        <div className="home-hero__profile">
          <div className="home-hero__avatar" style={{ background: profile.avatarColor }} aria-hidden="true">
            {avatarInitial}
          </div>
          <div>
            <h2 className="home-hero__title">{profile.name}</h2>
            <p className="home-hero__subtitle">{profile.grade}</p>
            <p className="home-hero__meta">志望校: {profile.goalSchools.join(' / ')}</p>
          </div>
        </div>
        <div className="home-hero__stats">
          <div className="home-hero__stat">
            <span>現在のポイント</span>
            <strong>{points.current}</strong>
            <small>累計 {points.lifetime}</small>
          </div>
          <div className="home-hero__stat">
            <span>ストリーク</span>
            <strong>{points.streak}日</strong>
            <small>ビンゴ {points.bingoCount} ライン</small>
          </div>
          <div className="home-hero__stat">
            <span>未読通知</span>
            <strong>{unreadNotifications}</strong>
            <small>{notifications.length} 件の最新情報</small>
          </div>
        </div>
        <div className="home-hero__actions">
          <button className="primary-button" type="button" onClick={() => navigate('/bingo')}>
            ビンゴカードを開く
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('/insights')}>
            学習分析を見る
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('/planner')}>
            学習計画を確認
          </button>
        </div>
        {nextSession && (
          <div className="home-hero__next-session">
            <strong>次の予定</strong>
            <p>
              {formatDateLabel(nextSession.startAt)} {formatTimeRange(nextSession.startAt, nextSession.durationMinutes)} ／{' '}
              {nextSession.title}
            </p>
          </div>
        )}
      </section>

      <div className="dashboard-grid">
        <section className="card" aria-labelledby="metrics-heading">
          <div className="section-title">
            <h3 id="metrics-heading">ポイントと学習状況</h3>
            <span className="metrics-highlight">今週 {insights.weeklyActivity.reduce((total, entry) => total + entry.completions, 0)} マス解放</span>
          </div>
          <div className="stat-grid">
            <div className="stat-tile">
              <span>登録カード数</span>
              <strong>{cards.length}</strong>
              <small>進行中のカードを確認しましょう</small>
            </div>
            <div className="stat-tile">
              <span>未完了ミッション</span>
              <strong>
                {cards.reduce(
                  (total, card) => total + card.tasks.filter((task) => !task.isCompleted).length,
                  0
                )}
              </strong>
              <small>合格ラインを目指してチャレンジ</small>
            </div>
            <div className="stat-tile">
              <span>実績バッジ</span>
              <strong>{unlockedAchievements.length}</strong>
              <small>{achievements.length}個中</small>
            </div>
          </div>
          <div className="metrics-grid">
            <div className="mini-chart" aria-label="週間クリア数">
              {insights.weeklyActivity.map((entry) => (
                <div key={entry.day} className="mini-chart__column">
                  <div
                    className="mini-chart__bar"
                    style={{ height: `${(entry.completions / weeklyMax) * 100}%` }}
                    aria-hidden="true"
                  >
                    <span className="mini-chart__value">{entry.completions}</span>
                  </div>
                  <span className="mini-chart__label">{entry.day}</span>
                </div>
              ))}
            </div>
            <div className="subject-summary">
              <h4>好調な科目</h4>
              <ul className="list-reset subject-list">
                {topSubjects.map((subject) => (
                  <li key={subject.subject} className="subject-list__item">
                    <span className="subject-list__name">{subject.subject}</span>
                    <span className="subject-list__value">{Math.round(subject.accuracy * 100)}%</span>
                    <span className="subject-list__target">目標 {Math.round(subject.target * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <aside className="card" id="notifications" aria-labelledby="notifications-heading">
          <div className="section-title">
            <h3 id="notifications-heading">通知センター</h3>
            <button type="button" className="secondary-button" onClick={markAllNotificationsRead}>
              すべて既読にする
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="empty-state">現在通知はありません。</div>
          ) : (
            <ul className="list-reset notification-list">
              {notifications.slice(0, 4).map((notification) => (
                <li
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? '' : 'notification-item--unread'}`}
                >
                  <div className="notification-item__header">
                    <strong>{notification.title}</strong>
                    <span className="notification-item__timestamp">
                      {new Date(notification.createdAt).toLocaleString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="notification-item__message">{notification.message}</p>
                  <div className="notification-item__actions">
                    {!notification.isRead && (
                      <button type="button" onClick={() => markNotificationRead(notification.id)}>
                        既読にする
                      </button>
                    )}
                    <button type="button" onClick={() => dismissNotification(notification.id)}>
                      閉じる
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <div className="dashboard-grid">
        <section className="card" aria-labelledby="cards-heading">
          <div className="section-title">
            <h3 id="cards-heading">カード別の進捗</h3>
            <button className="secondary-button" type="button" onClick={() => navigate('/bingo')}>
              カード一覧へ
            </button>
          </div>
          <ul className="list-reset">
            {progressByCard.map((card) => (
              <li key={card.id} className="list-item">
                <div className="section-title">
                  <div>
                    <strong>{card.title}</strong>
                    <p className="list-item__description">{card.description}</p>
                  </div>
                  <span className="list-item__value">{Math.round(card.completionRate * 100)}%</span>
                </div>
                <div className="progress-bar" aria-hidden="true">
                  <div className="progress-bar__value" style={{ width: `${card.completionRate * 100}%` }} />
                </div>
                <p className="list-item__meta">
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

        <aside className="card" aria-labelledby="plan-heading">
          <div className="section-title">
            <h3 id="plan-heading">学習計画タイムライン</h3>
            <button className="secondary-button" type="button" onClick={() => navigate('/planner')}>
              すべて表示
            </button>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="empty-state">学習計画を追加してみましょう。</div>
          ) : (
            <ul className="list-reset plan-list">
              {upcomingSessions.map((session) => (
                <li
                  key={session.id}
                  className={`plan-item ${session.status === 'completed' ? 'plan-item--completed' : ''}`}
                >
                  <label className="plan-item__control">
                    <input
                      type="checkbox"
                      checked={session.status === 'completed'}
                      onChange={() => togglePlanTask(session.id)}
                    />
                    <div>
                      <strong>{session.title}</strong>
                      <p className="plan-item__meta">
                        {formatDateLabel(session.startAt)} {formatTimeRange(session.startAt, session.durationMinutes)} ／{' '}
                        {session.subject} ／ {session.type}
                      </p>
                      <p className="plan-item__note">{session.coachNote}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <div className="dashboard-grid">
        <section className="card" aria-labelledby="coaching-heading">
          <div className="section-title">
            <h3 id="coaching-heading">コーチングとおすすめミッション</h3>
            <button className="secondary-button" type="button" onClick={() => navigate('/search')}>
              ミッション検索
            </button>
          </div>
          <div className="tip-grid">
            {coachingTips.map((tip) => (
              <article key={tip.id} className="tip-card">
                <h4>{tip.title}</h4>
                <p>{tip.message}</p>
                <a
                  href={tip.actionLink}
                  className="tip-card__action"
                  target={tip.actionLink.startsWith('http') ? '_blank' : undefined}
                  rel={tip.actionLink.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {tip.actionLabel}
                </a>
              </article>
            ))}
          </div>
          <h4>未着手のおすすめ</h4>
          {upcomingTasks.length === 0 ? (
            <div className="empty-state">すべてのミッションをクリアしました！新しいカードを追加しましょう。</div>
          ) : (
            <ul className="list-reset">
              {upcomingTasks.map((task) => (
                <li key={`${task.cardId}-${task.taskId}`} className="list-item list-item--compact">
                  <strong>
                    {task.cardTitle} #{task.taskId}
                  </strong>
                  <p className="list-item__description">{task.title}</p>
                  <p className="list-item__meta">
                    {task.category} ／ {task.difficulty}
                  </p>
                  <div className="list-item__actions">
                    <button className="primary-button" type="button" onClick={() => navigate(`/bingo/${task.cardId}`)}>
                      カードで開く
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="card" aria-labelledby="resources-heading">
          <h3 id="resources-heading">リソースライブラリ</h3>
          <ul className="list-reset resource-list">
            {resources.map((resource) => (
              <li key={resource.id} className="resource-card">
                <strong>{resource.title}</strong>
                <span className="resource-card__type">{resource.type}</span>
                <p>{resource.description}</p>
                <a href={resource.link} target="_blank" rel="noreferrer">
                  リンクを開く
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <section className="card" aria-labelledby="achievements-heading">
        <div className="section-title">
          <h3 id="achievements-heading">実績バッジコレクション</h3>
          <span className="metrics-highlight">
            {unlockedAchievements.length} / {achievements.length} 個アンロック
          </span>
        </div>
        <ul className="achievements-grid">
          {[...unlockedAchievements, ...lockedAchievements].map((achievement) => (
            <li
              key={achievement.id}
              className={`achievement-badge ${achievement.isUnlocked ? 'achievement-badge--unlocked' : 'achievement-badge--locked'}`}
            >
              <span className="achievement-badge__icon" aria-hidden="true">
                {achievement.icon}
              </span>
              <strong>{achievement.title}</strong>
              <p>{achievement.description}</p>
              <span className="achievement-badge__status">
                {achievement.isUnlocked
                  ? `獲得日: ${new Date(achievement.unlockedAt).toLocaleDateString('ja-JP')}`
                  : `条件: ${achievement.threshold} ${achievement.type === 'cells' ? 'マス' : ''}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card" aria-labelledby="profile-heading">
        <div className="section-title">
          <h3 id="profile-heading">プロフィール・支払い情報</h3>
          {savedMessage && <span className="form-feedback">{savedMessage}</span>}
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
            <textarea name="goalSchools" value={formState.goalSchools} onChange={handleChange} rows={3} />
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
              <p className="list-item__description">{activity.message}</p>
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
