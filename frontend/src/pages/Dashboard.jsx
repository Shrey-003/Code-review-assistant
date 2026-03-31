import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboard().catch(() => null),
      api.getSubmissions().catch(() => []),
    ]).then(([dash, subs]) => {
      setDashboard(dash);
      setSubmissions(Array.isArray(subs) ? subs : subs.submissions || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  const stats = dashboard || {};
  const streak = user?.currentStreak || stats.currentStreak || 0;
  const solved = stats.totalSolved || stats.problemsSolved || submissions.filter(s => s.verdict === 'Accepted').length;
  const total = stats.totalSubmissions || submissions.length;

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Welcome back, <strong>{user?.username || 'Coder'}</strong>!</p>
        </div>

        <div className="grid grid-4 stats-grid">
          <div className="stat-card glow-card">
            <div className="stat-value">{solved}</div>
            <div className="stat-label">Problems Solved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value streak-value">🔥 {streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{total > 0 ? Math.round((solved / total) * 100) : 0}%</div>
            <div className="stat-label">Acceptance Rate</div>
          </div>
        </div>

        <div className="recent-section">
          <h2>Recent Submissions</h2>
          {submissions.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <h3>No submissions yet</h3>
              <p>Start solving problems to track your progress!</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Language</th>
                    <th>Verdict</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.slice(0, 15).map((sub, i) => (
                    <tr key={sub._id || i}>
                      <td>{sub.problemId?.title || sub.problem?.title || 'Problem'}</td>
                      <td><span className="lang-badge">{sub.language}</span></td>
                      <td>
                        <span className={`badge ${sub.verdict === 'Accepted' ? 'badge-accepted' : 'badge-rejected'}`}>
                          {sub.verdict}
                        </span>
                      </td>
                      <td className="date-cell">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
