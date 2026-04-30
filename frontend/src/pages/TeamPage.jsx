import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { teamAPI } from '../services/api';
import './InnerPage.css';

export default function TeamPage() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('create'); // 'create' | 'join'
  const [form, setForm] = useState({ name: '', description: '', invite_code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const res = await teamAPI.getMyTeam();
      setTeam(res.data.team);
    } catch {
      setTeam(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const res = await teamAPI.create({ name: form.name, description: form.description });
      setTeam(res.data.team);
      setSuccess('Team created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      const res = await teamAPI.join({ invite_code: form.invite_code });
      setTeam(res.data.team);
      setSuccess('Joined team successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>👥 Team Management</h1>
          <p>Create a new team or join an existing one with an invite code.</p>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : team ? (
          <TeamView team={team} />
        ) : (
          <div className="inner-content fade-in">
            <div className="tab-switcher">
              <button
                className={`tab-btn ${view === 'create' ? 'active' : ''}`}
                onClick={() => setView('create')}
              >
                ✨ Create Team
              </button>
              <button
                className={`tab-btn ${view === 'join' ? 'active' : ''}`}
                onClick={() => setView('join')}
              >
                🔗 Join Team
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {view === 'create' ? (
              <div className="card">
                <h2 className="card-title">Create a New Team</h2>
                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label>Team Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Team Alpha"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="What is your team about?"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : '✨ Create Team'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card">
                <h2 className="card-title">Join an Existing Team</h2>
                <form onSubmit={handleJoin}>
                  <div className="form-group">
                    <label>Invite Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. A1B2C3D4"
                      value={form.invite_code}
                      onChange={(e) => setForm({ ...form, invite_code: e.target.value.toUpperCase() })}
                      required
                      style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Joining...' : '🔗 Join Team'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TeamView({ team }) {
  return (
    <div className="inner-content fade-in">
      <div className="card team-card">
        <div className="team-header">
          <div className="team-avatar">{team.name.charAt(0)}</div>
          <div>
            <h2>{team.name}</h2>
            <p>{team.description || 'No description provided'}</p>
          </div>
        </div>

        <div className="team-meta">
          <div className="meta-item">
            <span className="meta-label">Owner</span>
            <span className="meta-value">{team.owner_name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Invite Code</span>
            <span className="meta-value invite-code">{team.invite_code}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Members</span>
            <span className="meta-value">{team.members?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Team Members</h3>
        <div className="members-list">
          {team.members?.map((m) => (
            <div className="member-item" key={m.id}>
              <div className="member-avatar">{m.name.charAt(0)}</div>
              <div className="member-info">
                <span className="member-name">{m.name}</span>
                <span className="member-email">{m.email}</span>
              </div>
              <span className={`badge badge-${m.role}`}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
