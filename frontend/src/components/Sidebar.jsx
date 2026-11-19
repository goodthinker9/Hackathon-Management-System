import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import './Sidebar.css';

const navItems = {
  participant: [
    { path: '/dashboard', icon: 'home', label: 'Dashboard' },
    { path: '/hackathons', icon: 'zap', label: 'Hackathons' },
    { path: '/profile', icon: 'user', label: 'My Profile' },
  ],
  judge: [
    { path: '/dashboard', icon: 'home', label: 'Dashboard' },
    { path: '/hackathons', icon: 'zap', label: 'Hackathons' },
    { path: '/judge', icon: 'scale', label: 'Judge Panel' },
    { path: '/profile', icon: 'user', label: 'My Profile' },
  ],
  admin: [
    { path: '/dashboard', icon: 'home', label: 'Dashboard' },
    { path: '/hackathons', icon: 'zap', label: 'Hackathons' },
    { path: '/admin', icon: 'settings', label: 'Admin Panel' },
    { path: '/profile', icon: 'user', label: 'My Profile' },
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
          <span className="brand-icon"><Icon name="zap" size={22} /></span>
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
            className={`sidebar-link ${location.pathname === item.path || (item.path === '/hackathons' && location.pathname.startsWith('/hackathons')) ? 'active' : ''}`}
          >
            <span className="link-icon"><Icon name={item.icon} size={19} /></span>
            <span className="link-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          <Icon name="logOut" size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
