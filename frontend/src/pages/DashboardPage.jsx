import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { adminAPI, hackathonAPI } from '../services/api';
import HackathonPhaseBadge from '../components/HackathonPhaseBadge';
import Icon from '../components/Icon';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'participant') {
          const res = await hackathonAPI.getMine();
          setData({ hackathons: res.data.hackathons });
        } else if (user.role === 'judge') {
          const res = await hackathonAPI.list({ phase: 'judging', limit: 100 });
          setData({ hackathons: res.data.hackathons });
        } else if (user.role === 'admin') {
          const res = await adminAPI.getStats();
          setData({ stats: res.data.stats });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.role]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Welcome back, {user.name}</h1>
          <p>Here's what's happening in your hackathon journey.</p>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="dashboard-content fade-in">
            {user.role === 'participant' && <ParticipantDashboard data={data} />}
            {user.role === 'judge' && <JudgeDashboard data={data} />}
            {user.role === 'admin' && <AdminDashboard data={data} />}
          </div>
        )}
      </main>
    </div>
  );
}

function ParticipantDashboard({ data }) {
  const hackathons = data.hackathons || [];
  return (
    <div>
      <div className="quick-actions">
        <h2>My hackathons</h2>
        {hackathons.length ? (
          <div className="my-hackathons-grid">
            {hackathons.map((hackathon) => {
              const basePath = `/hackathons/${encodeURIComponent(hackathon.slug)}`;
              const action = hackathon.phase === 'completed'
                ? { label: 'View results', path: basePath }
                : !hackathon.is_in_team
                  ? { label: 'Set up team', path: `${basePath}/team` }
                  : hackathon.phase === 'hacking' && !hackathon.has_project
                  ? { label: 'Open project', path: `${basePath}/project` }
                  : { label: 'View event', path: basePath };
              return (
                <article className="my-hackathon-card" key={hackathon.id}>
                  <div className="my-hackathon-heading">
                    <h3>{hackathon.title}</h3>
                    <HackathonPhaseBadge phase={hackathon.phase} />
                  </div>
                  <p>Starts {new Date(hackathon.starts_at).toLocaleDateString()}</p>
                  <div className="my-hackathon-actions">
                    <Link className="btn btn-primary btn-sm" to={action.path}>{action.label}</Link>
                    <Link className="btn btn-secondary btn-sm" to={basePath}>Details</Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state card">
            <h3>You have not registered for a hackathon yet</h3>
            <p>Browse events and register to get started.</p>
            <Link className="btn btn-primary" to="/hackathons">Explore hackathons</Link>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/hackathons" className="action-card">
            <span className="action-icon"><Icon name="zap" size={25} /></span>
            <span>Browse Hackathons</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon"><Icon name="user" size={25} /></span>
            <span>My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function JudgeDashboard({ data }) {
  const hackathons = data.hackathons || [];
  return (
    <div>
      <div className="dash-stat-row">
        <div className="dash-stat">
          <span className="stat-val">{hackathons.length}</span>
          <span className="stat-lbl">Hackathons in Judging</span>
        </div>
      </div>
      <div className="my-hackathons-grid">
        {hackathons.map((hackathon) => (
          <article className="my-hackathon-card" key={hackathon.id}>
            <div className="my-hackathon-heading">
              <h3>{hackathon.title}</h3>
              <HackathonPhaseBadge phase={hackathon.phase} />
            </div>
            <Link className="btn btn-primary btn-sm" to={`/judge?hackathon=${encodeURIComponent(hackathon.slug)}`}>
              Score projects
            </Link>
          </article>
        ))}
        {!hackathons.length && <div className="empty-state card"><h3>No hackathons are being judged right now</h3></div>}
      </div>
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/judge" className="action-card">
            <span className="action-icon"><Icon name="scale" size={25} /></span>
            <span>Judge Projects</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon"><Icon name="user" size={25} /></span>
            <span>My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data }) {
  const stats = data.stats || {};
  const statItems = [
    { icon: 'user', label: 'Users', value: stats.users || 0, color: '#6c63ff' },
    { icon: 'users', label: 'Teams', value: stats.teams || 0, color: '#ff6584' },
    { icon: 'rocket', label: 'Projects', value: stats.projects || 0, color: '#43e97b' },
    { icon: 'award', label: 'Scores', value: stats.scores || 0, color: '#f7971e' },
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {statItems.map((s, i) => (
          <div className="admin-stat-card" key={i} style={{ '--accent-color': s.color }}>
            <div className="admin-stat-icon"><Icon name={s.icon} size={30} /></div>
            <div className="admin-stat-val">{s.value}</div>
            <div className="admin-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/admin" className="action-card">
            <span className="action-icon"><Icon name="settings" size={25} /></span>
            <span>Admin Panel</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon"><Icon name="user" size={25} /></span>
            <span>My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
