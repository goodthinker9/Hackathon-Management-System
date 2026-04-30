import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { teamAPI, projectAPI, leaderboardAPI, adminAPI } from '../services/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'participant') {
          const [teamRes, projectRes] = await Promise.allSettled([
            teamAPI.getMyTeam(),
            projectAPI.getMyProject(),
          ]);
          setData({
            team: teamRes.status === 'fulfilled' ? teamRes.value.data.team : null,
            project: projectRes.status === 'fulfilled' ? projectRes.value.data.project : null,
          });
        } else if (user.role === 'judge') {
          const res = await projectAPI.getAll();
          setData({ projects: res.data.projects });
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
          <h1>Welcome back, {user.name} 👋</h1>
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
  return (
    <div>
      <div className="dash-cards">
        <div className={`dash-card ${data.team ? 'status-ok' : 'status-pending'}`}>
          <div className="dash-card-icon">👥</div>
          <div className="dash-card-info">
            <h3>{data.team ? data.team.name : 'No Team Yet'}</h3>
            <p>{data.team ? `${data.team.members?.length || 0} members` : 'Create or join a team'}</p>
          </div>
          {!data.team && <Link to="/team" className="btn btn-primary btn-sm">Get Started</Link>}
        </div>

        <div className={`dash-card ${data.project ? 'status-ok' : 'status-pending'}`}>
          <div className="dash-card-icon">🚀</div>
          <div className="dash-card-info">
            <h3>{data.project ? data.project.title : 'No Project Yet'}</h3>
            <p>{data.project ? 'Project submitted' : 'Submit your project'}</p>
          </div>
          {!data.project && data.team && (
            <Link to="/project" className="btn btn-primary btn-sm">Submit</Link>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/team" className="action-card">
            <span className="action-icon">👥</span>
            <span>Manage Team</span>
          </Link>
          <Link to="/project" className="action-card">
            <span className="action-icon">🚀</span>
            <span>My Project</span>
          </Link>
          <Link to="/leaderboard" className="action-card">
            <span className="action-icon">🏆</span>
            <span>Leaderboard</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon">👤</span>
            <span>My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function JudgeDashboard({ data }) {
  const projects = data.projects || [];
  return (
    <div>
      <div className="dash-stat-row">
        <div className="dash-stat">
          <span className="stat-val">{projects.length}</span>
          <span className="stat-lbl">Projects to Judge</span>
        </div>
      </div>
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/judge" className="action-card">
            <span className="action-icon">⚖️</span>
            <span>Judge Projects</span>
          </Link>
          <Link to="/leaderboard" className="action-card">
            <span className="action-icon">🏆</span>
            <span>Leaderboard</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon">👤</span>
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
    { icon: '👤', label: 'Users', value: stats.users || 0, color: '#6c63ff' },
    { icon: '👥', label: 'Teams', value: stats.teams || 0, color: '#ff6584' },
    { icon: '🚀', label: 'Projects', value: stats.projects || 0, color: '#43e97b' },
    { icon: '⭐', label: 'Scores', value: stats.scores || 0, color: '#f7971e' },
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {statItems.map((s, i) => (
          <div className="admin-stat-card" key={i} style={{ '--accent-color': s.color }}>
            <div className="admin-stat-icon">{s.icon}</div>
            <div className="admin-stat-val">{s.value}</div>
            <div className="admin-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/admin" className="action-card">
            <span className="action-icon">⚙️</span>
            <span>Admin Panel</span>
          </Link>
          <Link to="/leaderboard" className="action-card">
            <span className="action-icon">🏆</span>
            <span>Leaderboard</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon">👤</span>
            <span>My Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
