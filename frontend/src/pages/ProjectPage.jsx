import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { projectAPI, scoreAPI } from '../services/api';
import ValidationErrors from '../components/ValidationErrors';
import './InnerPage.css';

export default function ProjectPage() {
  const [project, setProject] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', github_link: '' });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      const res = await projectAPI.getMyProject();
      setProject(res.data.project);
      const scoresRes = await scoreAPI.getByProject(res.data.project.id);
      setScores(scoresRes.data.scores);
    } catch {
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    setValidationErrors([]);
    try {
      const res = await projectAPI.submit(form);
      setProject(res.data.project);
      setSuccess('Project submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit project');
      setValidationErrors(err.response?.data?.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  const avgScore = scores.length
    ? (scores.reduce((a, s) => a + s.score, 0) / scores.length).toFixed(1)
    : null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>🚀 My Project</h1>
          <p>Submit your hackathon project and track your scores.</p>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : project ? (
          <div className="inner-content fade-in">
            <div className="card project-detail">
              <h2 className="project-title">{project.title}</h2>
              <p className="project-desc">{project.description}</p>
              <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="project-link">
                🔗 View on GitHub
              </a>
              <div className="team-meta" style={{ marginTop: 20 }}>
                <div className="meta-item">
                  <span className="meta-label">Team</span>
                  <span className="meta-value">{project.team_name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Submitted by</span>
                  <span className="meta-value">{project.submitter_name}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">
                Scores {avgScore && <span className="score-badge">{avgScore}/10</span>}
              </h3>
              {scores.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <h3>No scores yet</h3>
                  <p>Judges haven't scored your project yet.</p>
                </div>
              ) : (
                <div className="members-list">
                  {scores.map((s) => (
                    <div className="member-item" key={s.id}>
                      <div className="member-avatar">{s.judge_name.charAt(0)}</div>
                      <div className="member-info">
                        <span className="member-name">{s.judge_name}</span>
                        {s.feedback && <span className="member-email">{s.feedback}</span>}
                      </div>
                      <span className="score-badge" style={{ fontSize: 20 }}>{s.score}/10</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="inner-content fade-in">
            {error && <div className="alert alert-error">{error}</div>}
            <ValidationErrors errors={validationErrors} />
            {success && <div className="alert alert-success">{success}</div>}
            <div className="card">
              <h2 className="card-title">Submit Your Project</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Health Monitor"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    placeholder="Describe your project, what problem it solves, and how it works..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={5}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>GitHub Repository Link *</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={form.github_link}
                    onChange={(e) => setForm({ ...form, github_link: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : '🚀 Submit Project'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
