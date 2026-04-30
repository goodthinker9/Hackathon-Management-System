import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = {
  participant: [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/team', icon: '👥', label: 'My Team' },
    { path: '/project', icon: '🚀', label: 'My Project' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/profile', icon: '👤', label: 'My Profile' },
  ],
  judge: [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/judge', icon: '⚖️', label: 'Judge Panel' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/profile', icon: '👤', label: 'My Profile' },
  ],
  admin: [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/admin', icon: '⚙️', label: 'Admin Panel' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/profile', icon: '👤', label: 'My Profile' },
  ],
};

const AVATAR_BASE = 'http://localhost:5000';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarUrl = user?.avatar ? `${AVATAR_BASE}/${user.avatar}` : null;
  const initials = user?.name?.charAt(0).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link to="/">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">HackHub</span>
        </Link>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="link-icon">{item.icon}</span>
            <span className="link-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
