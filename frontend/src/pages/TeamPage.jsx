import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Icon from '../components/Icon';
import { hackathonAPI, teamAPI } from '../services/api';
import ValidationErrors from '../components/ValidationErrors';
import './InnerPage.css';

export default function TeamPage() {
  const { slug } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('create');
  const [form, setForm] = useState({ name: '', description: '', invite_code: '' });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const eventResponse = await hackathonAPI.get(slug);
        if (active) setHackathon(eventResponse.data.hackathon);
        try {
          const teamResponse = await teamAPI.getMyTeamForHackathon(slug);
          if (active) setTeam(teamResponse.data.team);
        } catch (requestError) {
          if (requestError.response?.status !== 404) throw requestError;
          if (active) setTeam(null);
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load team information');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [slug]);

  const handleTeamRequest = async (event, request) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setValidationErrors([]);
    setSubmitting(true);
    try {
      const response = await request();
      setTeam(response.data.team);
      setSuccess(response.data.message || 'Team updated');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update team');
      setValidationErrors(requestError.response?.data?.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  const submissionClosed = hackathon && Date.now() > new Date(hackathon.submission_deadline).getTime();

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <Link className="back-link" to={`/hackathons/${encodeURIComponent(slug)}`}><Icon name="arrowLeft" size={16} /> {hackathon?.title || 'Hackathon'}</Link>
          <h1><Icon name="users" size={30} /> Team Management</h1>
          <p>Create a team or join one for this hackathon.</p>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : error && !hackathon ? (
          <div className="alert alert-error">{error}</div>
        ) : team ? (
          <TeamView team={team} />
        ) : !hackathon?.is_registered ? (
          <div className="inner-content fade-in">
            <div className="empty-state card">
              <div className="empty-icon"><Icon name="clipboard" size={44} /></div>
              <h3>Register for this hackathon first</h3>
              <p>Team creation and joining are available to registered participants.</p>
              <Link className="btn btn-primary" to={`/hackathons/${encodeURIComponent(slug)}`}>Go to registration</Link>
            </div>
          </div>
        ) : submissionClosed ? (
          <div className="inner-content fade-in">
            <div className="empty-state card">
              <div className="empty-icon"><Icon name="hourglass" size={44} /></div>
              <h3>Team changes are closed</h3>
              <p>The team deadline was {new Date(hackathon.submission_deadline).toLocaleString()}.</p>
            </div>
          </div>
        ) : (
          <div className="inner-content fade-in">
            <div className="tab-switcher">
              <button className={`tab-btn ${view === 'create' ? 'active' : ''}`} onClick={() => setView('create')}><Icon name="users" size={16} /> Create Team</button>
              <button className={`tab-btn ${view === 'join' ? 'active' : ''}`} onClick={() => setView('join')}><Icon name="key" size={16} /> Join Team</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <ValidationErrors errors={validationErrors} />
            {success && <div className="alert alert-success">{success}</div>}
            {view === 'create' ? (
              <div className="card">
                <h2 className="card-title">Create a New Team</h2>
                <p className="member-email">Maximum team size: {hackathon.max_team_size}</p>
                <form onSubmit={(event) => handleTeamRequest(event, () => teamAPI.createForHackathon(slug, { name: form.name, description: form.description }))}>
                  <div className="form-group">
                    <label>Team Name *</label>
                    <input type="text" placeholder="e.g. Team Alpha" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="What is your team about?" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : <><Icon name="users" size={16} /> Create Team</>}</button>
                </form>
              </div>
            ) : (
              <div className="card">
                <h2 className="card-title">Join an Existing Team</h2>
                <form onSubmit={(event) => handleTeamRequest(event, () => teamAPI.joinForHackathon(slug, { invite_code: form.invite_code }))}>
                  <div className="form-group">
                    <label>Invite Code *</label>
                    <input type="text" placeholder="e.g. A1B2C3D4" value={form.invite_code} onChange={(event) => setForm({ ...form, invite_code: event.target.value.toUpperCase() })} required style={{ textTransform: 'uppercase', letterSpacing: '2px' }} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Joining...' : <><Icon name="key" size={16} /> Join Team</>}</button>
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
          <div><h2>{team.name}</h2><p>{team.description || 'No description provided'}</p></div>
        </div>
        <div className="team-meta">
          <div className="meta-item"><span className="meta-label">Owner</span><span className="meta-value">{team.owner_name}</span></div>
          <div className="meta-item"><span className="meta-label">Invite Code</span><span className="meta-value invite-code">{team.invite_code}</span></div>
          <div className="meta-item"><span className="meta-label">Members</span><span className="meta-value">{team.members?.length || team.member_count} / {team.max_team_size}</span></div>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Team Members</h3>
        <div className="members-list">
          {team.members?.map((member) => (
            <div className="member-item" key={member.id}>
              <div className="member-avatar">{member.name.charAt(0)}</div>
              <div className="member-info"><span className="member-name">{member.name}</span><span className="member-email">{member.email}</span></div>
              <span className={`badge badge-${member.role}`}>{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
