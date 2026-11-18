import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { hackathonAPI, projectAPI, scoreAPI } from '../services/api';
import ValidationErrors from '../components/ValidationErrors';
import './InnerPage.css';

const emptyForm = { title: '', description: '', github_link: '' };

export default function ProjectPage() {
  const { slug } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [project, setProject] = useState(null);
  const [scores, setScores] = useState([]);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadProject() {
      try {
        const [eventResponse, projectResponse] = await Promise.all([
          hackathonAPI.get(slug),
          projectAPI.getMyProjectForHackathon(slug),
        ]);
        if (!active) return;
        setHackathon(eventResponse.data.hackathon);
        setProject(projectResponse.data.project);
        setEmptyMessage(projectResponse.data.message || '');
        if (projectResponse.data.project) {
          setForm({
            title: projectResponse.data.project.title,
            description: projectResponse.data.project.description,
            github_link: projectResponse.data.project.github_link,
          });
          if (eventResponse.data.hackathon.results_published_at) {
            const scoreResponse = await scoreAPI.getByProject(projectResponse.data.project.id);
            if (active) setScores(scoreResponse.data.scores);
          }
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Unable to load project information');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProject();
    return () => { active = false; };
  }, [slug]);

  const canSubmit = hackathon
    && Date.now() >= new Date(hackathon.starts_at).getTime()
    && Date.now() <= new Date(hackathon.submission_deadline).getTime();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setValidationErrors([]);
    setSubmitting(true);
    try {
      const response = project
        ? await projectAPI.updateForHackathon(slug, project.id, form)
        : await projectAPI.submitForHackathon(slug, form);
      setProject(response.data.project);
      setEditing(false);
      setSuccess(response.data.message || 'Project saved successfully');
      if (!project) setScores([]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to save project');
      setValidationErrors(requestError.response?.data?.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  const average = scores.length
    ? (scores.reduce((total, score) => total + Number(score.score), 0) / scores.length).toFixed(1)
    : null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <Link className="back-link" to={`/hackathons/${encodeURIComponent(slug)}`}>← {hackathon?.title || 'Hackathon'}</Link>
          <h1>🚀 My Project</h1>
          <p>Submit and track your project for this hackathon.</p>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : error && !hackathon ? (
          <div className="alert alert-error">{error}</div>
        ) : project && !editing ? (
          <div className="inner-content fade-in">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="card project-detail">
              <h2 className="project-title">{project.title}</h2>
              <p className="project-desc">{project.description}</p>
              <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="project-link">🔗 View on GitHub</a>
              <div className="team-meta" style={{ marginTop: 20 }}>
                <div className="meta-item"><span className="meta-label">Team</span><span className="meta-value">{project.team_name}</span></div>
                <div className="meta-item"><span className="meta-label">Submitted by</span><span className="meta-value">{project.submitter_name}</span></div>
              </div>
              {canSubmit && <button className="btn btn-outline btn-sm" style={{ marginTop: 20 }} onClick={() => setEditing(true)}>Edit project</button>}
            </div>
            <div className="card">
              <h3 className="card-title">Scores {average && <span className="score-badge">{average}/10</span>}</h3>
              {!scores.length ? (
                <div className="empty-state"><div className="empty-icon">⏳</div><h3>No scores yet</h3><p>Judges have not scored your project yet.</p></div>
              ) : (
                <div className="members-list">
                  {scores.map((score) => (
                    <div className="member-item" key={score.id}>
                      <div className="member-avatar">{score.judge_name.charAt(0)}</div>
                      <div className="member-info"><span className="member-name">{score.judge_name}</span>{score.feedback && <span className="member-email">{score.feedback}</span>}</div>
                      <span className="score-badge" style={{ fontSize: 20 }}>{score.score}/10</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="inner-content fade-in">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <ValidationErrors errors={validationErrors} />
            {!canSubmit && !project ? (
              <div className="empty-state card">
                <div className="empty-icon">⏳</div>
                <h3>{emptyMessage || 'Project submissions are closed'}</h3>
                {hackathon && hackathon.phase === 'upcoming' && <p>Submissions open on {new Date(hackathon.starts_at).toLocaleString()}.</p>}
                <Link className="btn btn-secondary" to={`/hackathons/${encodeURIComponent(slug)}/team`}>View team</Link>
              </div>
            ) : (
              <div className="card">
                <h2 className="card-title">{project ? 'Edit Your Project' : 'Submit Your Project'}</h2>
                {hackathon && <p className="member-email">Submissions close {new Date(hackathon.submission_deadline).toLocaleString()}.</p>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Project Title *</label>
                    <input type="text" placeholder="e.g. AI Health Monitor" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea placeholder="Describe your project, what problem it solves, and how it works..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} required />
                  </div>
                  <div className="form-group">
                    <label>GitHub Repository Link *</label>
                    <input type="url" placeholder="https://github.com/username/repo" value={form.github_link} onChange={(event) => setForm({ ...form, github_link: event.target.value })} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : project ? 'Save changes' : '🚀 Submit Project'}</button>
                  {project && <button type="button" className="btn btn-secondary" style={{ marginLeft: 10 }} onClick={() => setEditing(false)}>Cancel</button>}
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
