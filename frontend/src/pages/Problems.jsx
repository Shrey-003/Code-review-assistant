import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import './Problems.css';

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');

  useEffect(() => {
    api.getProblems()
      .then(data => setProblems(Array.isArray(data) ? data : data.problems || []))
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, []);

  // Extract all unique tags
  const allTags = Array.from(new Set(problems.flatMap(p => p.tags || []))).sort();

  const filtered = problems.filter(p => {
    const matchDiff = filter === 'all' || p.difficulty.toLowerCase() === filter.toLowerCase();
    const matchTag = tagFilter === '' || (p.tags && p.tags.includes(tagFilter));
    return matchDiff && matchTag;
  });

  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="container fade-in">
        <div className="page-header">
          <h1>⚔️ Problems</h1>
          <p>Practice coding problems and sharpen your skills</p>
        </div>

        <div className="problems-toolbar">
          <div className="filter-tabs">
            {['all', 'easy', 'medium', 'hard'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`filter-tab ${filter === f ? 'active' : ''}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {allTags.length > 0 && (
            <div className="filter-tags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: '#888' }}>Topics:</span>
              <button 
                onClick={() => setTagFilter('')}
                className={`tag ${tagFilter === '' ? 'active-tag' : ''}`}
                style={{ cursor: 'pointer', border: tagFilter === '' ? '1px solid #6366f1' : '1px solid transparent' }}>
                All
              </button>
              {allTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setTagFilter(tag)}
                  className={`tag ${tagFilter === tag ? 'active-tag' : ''}`}
                  style={{ cursor: 'pointer', border: tagFilter === tag ? '1px solid #6366f1' : '1px solid transparent' }}>
                  {tag}
                </button>
              ))}
            </div>
          )}
          
          <span className="problem-count">{filtered.length} problems</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No problems found</h3>
            <p>No problems match the current filter</p>
          </div>
        ) : (
          <div className="problems-list">
            {filtered.map((problem, i) => (
              <Link to={`/problems/${problem._id}`} key={problem._id} className="problem-row"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="problem-info">
                  <span className="problem-number">#{i + 1}</span>
                  <div>
                    <h3 className="problem-title">{problem.title}</h3>
                    <div className="problem-tags">
                      {problem.tags?.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                </div>
                <div className="problem-meta">
                  <span className={`badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
