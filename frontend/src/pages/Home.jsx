import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content fade-in">
          <span className="hero-badge">⚡ Online Judge Platform</span>
          <h1 className="hero-title">
            Master Your <span className="gradient-text">Coding Skills</span>
          </h1>
          <p className="hero-subtitle">
            Solve challenging problems, track your progress, and compete with fellow developers on our modern online judge platform.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/problems" className="btn btn-primary btn-lg">Start Coding →</Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free →</Link>
                <Link to="/problems" className="btn btn-secondary btn-lg">Browse Problems</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container features fade-in">
        <div className="grid grid-3">
          <div className="feature-card card">
            <span className="feature-icon">🖥️</span>
            <h3>Code Editor</h3>
            <p>Full-featured Monaco editor with syntax highlighting, auto-complete, and multi-language support</p>
          </div>
          <div className="feature-card card">
            <span className="feature-icon">⚡</span>
            <h3>Instant Feedback</h3>
            <p>Run your code against test cases and get real-time results with detailed verdict breakdowns</p>
          </div>
          <div className="feature-card card">
            <span className="feature-icon">🏆</span>
            <h3>Compete & Climb</h3>
            <p>Track your streaks, build your profile, and compete on the leaderboard with other coders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
