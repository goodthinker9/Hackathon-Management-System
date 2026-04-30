import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { projectAPI, scoreAPI } from '../services/api';
import './InnerPage.css';

export default function JudgePage() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreForm, setScoreForm] = useState({ score: 5, feedback: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectAPI.getAll();
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (project) => {
    setSelected(project);
    setError(''); setSuccess('');
    setScoreForm({ score: 5, feedback: '' });
    try {
      const res = await scoreAPI.getByProject(project.id);
      setScores(res.data.scores);
    } catch {
      setScores([]);
    }
  };

  const handleScore = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await scoreAPI.submit({
        project_id: selected.id,
        score: parseInt(scoreForm.score),
        feedback: scoreForm.feedback,
      });
      setSuccess('Score submitted successfully!');
      // Refresh scores
      const res = await scoreAPI.getByProject(selected.id);
      setScores(res.data.scores);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const hasScored = (projectId) => {
    // We can't easily check this client-side without user id, so we rely on server error
    return false;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>⚖️ Judge Panel</h1>
          <p>Review and score submitted projects. Each project can only be scored once.</p>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="judge-layout fade-in">
            {/* Projects list */}
            <div className="projects-list-panel">
              <h3 className="panel-title">Projects ({projects.length})</h3>
              {projects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No projects yet</h3>
                </div>
              ) : (
                projects.map((p) => (
                  <div
                    key={p.id}
                    className={`project-list-item ${selected?.id === p.id ? 'active' : ''}`}
                    onClick={() => selectProject(p)}
                  >
                    <div className="pli-title">{p.title}</div>
                    <div className="pli-team">{p.team_name}</div>
                    {p.avg_score > 0 && (
                      <div className="pli-score">⭐ {parseFloat(p.avg_score).toFixed(1)}</div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Score panel */}
            <div className="score-panel">
              {!selected ? (
                <div className="empty-state" style={{ height: '100%' }}>
                  <div className="empty-icon">👈</div>
                  <h3>Select a project to score</h3>
                  <p>Click on a project from the list to review and score it.</p>
                </div>
              ) : (
                <div>
                  <div className="card" style={{ marginBottom: 20 }}>
                    <h2 className="project-title">{selected.title}</h2>
                    <p className="project-desc">{selected.description}</p>
                    <a href={selected.github_link} target="_blank" rel="noopener noreferrer" className="project-link">
                      🔗 View on GitHub
                    </a>
                    <div className="team-meta" style={{ marginTop: 16 }}>
                      <div className="meta-item">
                        <span className="meta-label">Team</span>
                        <span className="meta-value">{selected.team_name}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Scores received</span>
                        <span className="meta-value">{selected.score_count || 0}</span>
                      </div>
                    </div>
                  </div>

                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  {!success && (
                    <div className="card">
                      <h3 className="card-title">Submit Your Score</h3>
                      <form onSubmit={handleScore}>
                        <div className="form-group">
                          <label>Score: <strong style={{ color: 'var(--primary-light)' }}>{scoreForm.score} / 10</strong></label>
                          <div className="score-value-display">{scoreForm.score}</div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={scoreForm.score}
                            onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })}
                            className="score-slider"
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            <span>1 (Poor)</span>
                            <span>10 (Excellent)</span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Feedback (optional)</label>
                          <textarea
                            placeholder="Share your thoughts on this project..."
                            value={scoreForm.feedback}
                            onChange={(e) => setScoreForm({ ...scoreForm, feedback: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                          {submitting ? 'Submitting...' : '⭐ Submit Score'}
                        </button>
                      </form>
                    </div>
                  )}

                  {scores.length > 0 && (
                    <div className="card" style={{ marginTop: 20 }}>
                      <h3 className="card-title">All Scores</h3>
                      <div className="members-list">
                        {scores.map((s) => (
                          <div className="member-item" key={s.id}>
                            <div className="member-avatar">{s.judge_name.charAt(0)}</div>
                            <div className="member-info">
                              <span className="member-name">{s.judge_name}</span>
                              {s.feedback && <span className="member-email">{s.feedback}</span>}
                            </div>
                            <span className="score-badge" style={{ fontSize: 18 }}>{s.score}/10</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
