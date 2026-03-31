import { useState, useEffect } from 'react';
import { api } from '../api';
import './Leaderboard.css';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then(data => setLeaders(Array.isArray(data) ? data : data.leaderboard || []))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="page-header">
          <h1>🏆 Leaderboard</h1>
          <p>Top coders ranked by problems solved</p>
        </div>

        {leaders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🏆</span>
            <h3>No data yet</h3>
            <p>Be the first to solve a problem and claim the #1 spot!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaders.map((entry, i) => (
              <div key={entry._id || i} className={`leader-row ${i < 3 ? 'top-' + (i + 1) : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}>
                <div className="leader-rank">
                  {i < 3 ? <span className="medal">{medals[i]}</span> : <span className="rank-num">{i + 1}</span>}
                </div>
                <div className="leader-avatar">
                  {(entry.username || entry.user?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="leader-info">
                  <span className="leader-name">{entry.username || entry.user?.username || 'Anonymous'}</span>
                  <span className="leader-streak">🔥 {entry.currentStreak || 0} day streak</span>
                </div>
                <div className="leader-stats">
                  <span className="leader-solved">{entry.totalSolved || entry.problemsSolved || 0} solved</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
