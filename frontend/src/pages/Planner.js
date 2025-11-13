import React, { useMemo } from 'react';
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

const Planner = () => {
  const { studyPlan, togglePlanTask, coachingTips, insights } = useAppContext();
  const navigate = useNavigate();

  const groupedSessions = useMemo(() => {
    const groups = studyPlan.reduce((acc, session) => {
      const dayKey = new Date(session.startAt).toISOString().slice(0, 10);
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(session);
      return acc;
    }, {});
    return Object.entries(groups)
      .map(([dateKey, sessions]) => ({
        dateKey,
        label: formatDateLabel(sessions[0].startAt),
        sessions: sessions.sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
      }))
      .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));
  }, [studyPlan]);

  const summary = useMemo(() => {
    const completed = studyPlan.filter((session) => session.status === 'completed').length;
    return {
      total: studyPlan.length,
      completed,
      upcoming: studyPlan.length - completed
    };
  }, [studyPlan]);

  const weakestSubject = useMemo(() => {
    if (insights.subjectPerformance.length === 0) {
      return null;
    }
    return [...insights.subjectPerformance].sort((a, b) => a.accuracy - b.accuracy)[0];
  }, [insights.subjectPerformance]);

  return (
    <div className="dashboard-container">
      <section className="card">
        <div className="section-title">
          <h2>学習計画</h2>
          <span className="metrics-highlight">
            {summary.completed} / {summary.total} セッション完了
          </span>
        </div>
        <div className="stat-grid">
          <div className="stat-tile">
            <span>今後の予定</span>
            <strong>{summary.upcoming}</strong>
            <small>未完了の学習セッション</small>
          </div>
          <div className="stat-tile">
            <span>今週のフォーカス</span>
            <strong>{weakestSubject ? weakestSubject.subject : '---'}</strong>
            <small>
              {weakestSubject
                ? `平均 ${Math.round(weakestSubject.accuracy * 100)}% ／ 目標 ${Math.round(
                    weakestSubject.target * 100
                  )}%`
                : 'データがありません'}
            </small>
          </div>
          <div className="stat-tile">
            <span>推奨アクション</span>
            <strong>{coachingTips[0]?.title || '---'}</strong>
            <small>{coachingTips[0]?.message || '最新のコーチングを確認しましょう。'}</small>
          </div>
        </div>
        <div className="planner-actions">
          <button className="primary-button" type="button" onClick={() => navigate('/bingo')}>
            ミッションを割り当てる
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('/search')}>
            ミッションを探す
          </button>
        </div>
      </section>

      <section className="card" aria-labelledby="timeline-heading">
        <div className="section-title">
          <h3 id="timeline-heading">タイムライン</h3>
          <span className="metrics-highlight">直近 {groupedSessions.length} 日分を表示</span>
        </div>
        {groupedSessions.length === 0 ? (
          <div className="empty-state">学習計画がまだ設定されていません。ホーム画面から追加してみましょう。</div>
        ) : (
          <div className="timeline">
            {groupedSessions.map((group) => (
              <div key={group.dateKey} className="timeline__day">
                <div className="timeline__header">
                  <h4>{group.label}</h4>
                  <span>{group.sessions.length} 件</span>
                </div>
                <ul className="timeline__list">
                  {group.sessions.map((session) => (
                    <li key={session.id} className={`timeline__item ${session.status === 'completed' ? 'timeline__item--completed' : ''}`}>
                      <div className="timeline__time">{formatTimeRange(session.startAt, session.durationMinutes)}</div>
                      <div className="timeline__content">
                        <strong>{session.title}</strong>
                        <p className="timeline__meta">
                          {session.subject} ／ {session.type} ／ {session.location}
                        </p>
                        <p className="timeline__note">{session.coachNote}</p>
                      </div>
                      <div className="timeline__actions">
                        <label>
                          <input
                            type="checkbox"
                            checked={session.status === 'completed'}
                            onChange={() => togglePlanTask(session.id)}
                          />
                          完了
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="coaching-detail-heading">
        <h3 id="coaching-detail-heading">コーチングメモ</h3>
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
      </section>
    </div>
  );
};

export default Planner;
