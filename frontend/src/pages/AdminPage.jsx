import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../services/api';
import ValidationErrors from '../components/ValidationErrors';
import './AdminPage.css';

const TABS = ['Users', 'Teams', 'Projects', 'Scores'];

export default function AdminPage() {
  const [tab, setTab] = useState('Users');
  const [data, setData] = useState({ users: [], teams: [], projects: [], scores: [] });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'participant' });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, teamsRes, projectsRes, scoresRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getTeams(),
        adminAPI.getProjects(),
        adminAPI.getScores(),
      ]);
      setStats(statsRes.data.stats);
      setData({
        users: usersRes.data.users,
        teams: teamsRes.data.teams,
        projects: projectsRes.data.projects,
        scores: scoresRes.data.scores,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      setData((d) => ({ ...d, users: d.users.filter((u) => u.id !== id) }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await adminAPI.deleteProject(id);
      setData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setValidationErrors([]);
    try {
      const res = await adminAPI.createUser(newUser);
      setData((d) => ({ ...d, users: [res.data.user, ...d.users] }));
      setSuccess('User created successfully!');
      setNewUser({ name: '', email: '', password: '', role: 'participant' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
      setValidationErrors(err.response?.data?.errors || []);
    }
  };

  const statItems = [
    { icon: '👤', label: 'Users', value: stats.users || 0, color: '#6c63ff' },
    { icon: '👥', label: 'Teams', value: stats.teams || 0, color: '#ff6584' },
    { icon: '🚀', label: 'Projects', value: stats.projects || 0, color: '#43e97b' },
    { icon: '⭐', label: 'Scores', value: stats.scores || 0, color: '#f7971e' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>⚙️ Admin Dashboard</h1>
          <p>Manage users, teams, projects, and scores.</p>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid" style={{ marginBottom: 32 }}>
          {statItems.map((s, i) => (
            <div className="admin-stat-card" key={i} style={{ '--accent-color': s.color }}>
              <div className="admin-stat-icon">{s.icon}</div>
              <div className="admin-stat-val">{s.value}</div>
              <div className="admin-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`admin-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="fade-in">
            {tab === 'Users' && (
              <UsersTab
                users={data.users}
                onDelete={handleDeleteUser}
                newUser={newUser}
                setNewUser={setNewUser}
                onCreateUser={handleCreateUser}
                error={error}
                validationErrors={validationErrors}
                success={success}
              />
            )}
            {tab === 'Teams' && <TeamsTab teams={data.teams} />}
            {tab === 'Projects' && <ProjectsTab projects={data.projects} onDelete={handleDeleteProject} />}
            {tab === 'Scores' && <ScoresTab scores={data.scores} />}
          </div>
        )}
      </main>
    </div>
  );
}

function UsersTab({ users, onDelete, newUser, setNewUser, onCreateUser, error, validationErrors, success }) {
  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="card-title">Create New User</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <ValidationErrors errors={validationErrors} />
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={onCreateUser} className="create-user-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required placeholder="Full name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required placeholder="Min 6 chars" />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="participant">Participant</option>
              <option value="judge">Judge</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">+ Create User</button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">All Users ({users.length})</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TeamsTab({ teams }) {
  return (
    <div className="card">
      <h3 className="card-title">All Teams ({teams.length})</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Owner</th>
              <th>Members</th>
              <th>Invite Code</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</td>
                <td>{t.owner_name}</td>
                <td>{t.member_count}</td>
                <td><code style={{ color: 'var(--primary-light)', letterSpacing: 2 }}>{t.invite_code}</code></td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectsTab({ projects, onDelete }) {
  return (
    <div className="card">
      <h3 className="card-title">All Projects ({projects.length})</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Team</th>
              <th>Submitted By</th>
              <th>Avg Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</div>
                  <a href={p.github_link} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: 'var(--primary-light)' }}>GitHub →</a>
                </td>
                <td>{p.team_name}</td>
                <td>{p.submitter_name}</td>
                <td>{p.avg_score > 0 ? `${parseFloat(p.avg_score).toFixed(1)}/10` : '—'}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoresTab({ scores }) {
  return (
    <div className="card">
      <h3 className="card-title">All Scores ({scores.length})</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Judge</th>
              <th>Score</th>
              <th>Feedback</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.project_title}</td>
                <td>{s.judge_name}</td>
                <td>
                  <span style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: s.score >= 8 ? 'var(--success)' : s.score >= 5 ? 'var(--warning)' : 'var(--error)'
                  }}>
                    {s.score}/10
                  </span>
                </td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.feedback || '—'}
                </td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
