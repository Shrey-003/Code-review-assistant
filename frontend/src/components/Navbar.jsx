import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">CodeJudge</span>
        </Link>

        <div className="navbar-links">
          <Link to="/problems" className="nav-link">Problems</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" style={{ color: 'var(--primary-color)' }}>⚙️ Admin</Link>
              )}
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <div className="nav-user">
                <span className="nav-avatar">{user.username?.[0]?.toUpperCase() || 'U'}</span>
                <span className="nav-username">{user.username}</span>
                <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-sm btn-secondary">Login</Link>
              <Link to="/signup" className="btn btn-sm btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
