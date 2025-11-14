import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

const Insights = () => {
  const { insights, achievements, points } = useAppContext();

  const unlockedCount = achievements.filter((achievement) => achievement.isUnlocked).length;
  const weeklyTotal = useMemo(
    () => insights.weeklyActivity.reduce((total, entry) => total + entry.completions, 0),
    [insights.weeklyActivity]
  );
  const weeklyMax = useMemo(
    () => Math.max(1, ...insights.weeklyActivity.map((entry) => entry.completions)),
    [insights.weeklyActivity]
  );

  return (
    <div className="dashboard-container">
      <section className="card">
        <div className="section-title">
          <h2>学習分析ダッシュボード</h2>
          <span className="metrics-highlight">累計ポイント {points.lifetime}</span>
        </div>
        <div className="stat-grid">
          <div className="stat-tile">
            <span>週間クリア数</span>
            <strong>{weeklyTotal}</strong>
            <small>今週クリアしたミッション数</small>
          </div>
          <div className="stat-tile">
            <span>実績バッジ</span>
            <strong>{unlockedCount}</strong>
            <small>全 {achievements.length} 個中</small>
          </div>
          <div className="stat-tile">
            <span>現在のストリーク</span>
            <strong>{points.streak}日</strong>
            <small>次の目標: 7日連続</small>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="card" aria-labelledby="weekly-heading">
          <h3 id="weekly-heading">週間アクティビティ</h3>
          <div className="mini-chart mini-chart--large">
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
        </section>

        <aside className="card" aria-labelledby="difficulty-heading">
          <h3 id="difficulty-heading">難易度別の達成状況</h3>
          <ul className="list-reset difficulty-list">
            {insights.difficultyBreakdown.map((item) => {
              const completion = item.total > 0 ? item.cleared / item.total : 0;
              const attemptRate = item.total > 0 ? item.attempted / item.total : 0;
              return (
                <li key={item.difficulty} className="difficulty-list__item">
                  <div className="difficulty-list__header">
                    <strong>{item.difficulty}</strong>
                    <span>{Math.round(completion * 100)}%</span>
                  </div>
                  <div className="progress-bar difficulty-list__progress" aria-hidden="true">
                    <div className="progress-bar__value" style={{ width: `${completion * 100}%` }} />
                  </div>
                  <p className="difficulty-list__meta">
                    クリア {item.cleared} / {item.total}（挑戦 {item.attempted}）
                  </p>
                  <div className="difficulty-list__attempt">
                    <span>挑戦率</span>
                    <div className="progress-bar progress-bar--muted" aria-hidden="true">
                      <div className="progress-bar__value" style={{ width: `${Math.min(1, attemptRate) * 100}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      <section className="card" aria-labelledby="subject-heading">
        <h3 id="subject-heading">科目別パフォーマンス</h3>
        <table className="insight-table">
          <thead>
            <tr>
              <th scope="col">科目</th>
              <th scope="col">平均正答率</th>
              <th scope="col">目標</th>
              <th scope="col">挑戦回数</th>
              <th scope="col">達成状況</th>
            </tr>
          </thead>
          <tbody>
            {insights.subjectPerformance.map((subject) => {
              const accuracy = Math.round(subject.accuracy * 100);
              const target = Math.round(subject.target * 100);
              const delta = accuracy - target;
              return (
                <tr key={subject.subject}>
                  <th scope="row">{subject.subject}</th>
                  <td>{accuracy}%</td>
                  <td>{target}%</td>
                  <td>{subject.attempts}回</td>
                  <td className={delta >= 0 ? 'insight-table__positive' : 'insight-table__negative'}>
                    {delta >= 0 ? `+${delta}%` : `${delta}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="dashboard-grid">
        <section className="card" aria-labelledby="history-heading">
          <h3 id="history-heading">最近のチャレンジ</h3>
          <ul className="list-reset challenge-history">
            {insights.recentChallenges.slice(0, 8).map((attempt) => (
              <li key={attempt.id} className="challenge-history__item">
                <div className="challenge-history__title">
                  <strong>
                    {attempt.cardTitle} #{attempt.taskId}
                  </strong>
                  <span className={`challenge-history__status ${attempt.passed ? 'is-passed' : 'is-failed'}`}>
                    {attempt.passed ? '合格' : '未達'}
                  </span>
                </div>
                <p className="challenge-history__meta">
                  {attempt.category} ／ {attempt.difficulty} ／ 正答率 {Math.round(attempt.score * 100)}%
                </p>
                <span className="challenge-history__timestamp">
                  {new Date(attempt.attemptedAt).toLocaleString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="card" aria-labelledby="bingo-heading">
          <h3 id="bingo-heading">月別ビンゴ達成</h3>
          <ul className="list-reset bingo-list">
            {insights.monthlyBingo.map((entry) => (
              <li key={entry.month} className="bingo-list__item">
                <span className="bingo-list__label">{entry.month}</span>
                <div className="progress-bar bingo-list__progress" aria-hidden="true">
                  <div className="progress-bar__value" style={{ width: `${Math.min(entry.lines / 5, 1) * 100}%` }} />
                </div>
                <span className="bingo-list__value">{entry.lines} ライン</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default Insights;
