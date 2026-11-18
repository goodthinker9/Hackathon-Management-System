import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import HackathonPhaseBadge from '../components/HackathonPhaseBadge';
import { useAuth } from '../context/AuthContext';
import { hackathonAPI, projectAPI, scoreAPI } from '../services/api';
import ValidationErrors from '../components/ValidationErrors';
import './InnerPage.css';

export default function JudgePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreForm, setScoreForm] = useState({ score: 5, feedback: '' });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    hackathonAPI.list({ phase: 'judging', limit: 100 })
      .then((response) => {
        if (!active) return;
        const events = response.data.hackathons;
        setHackathons(events);
        const requestedSlug = searchParams.get('hackathon');
        const initial = events.find((event) => event.slug === requestedSlug) || events[0];
        setSelectedHackathon(initial?.slug || '');
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load judging hackathons'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedHackathon) {
      setProjects([]);
      setSelected(null);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setSelected(null);
    setSearchParams({ hackathon: selectedHackathon }, { replace: true });
    projectAPI.getAllForHackathon(selectedHackathon)
      .then((response) => { if (active) setProjects(response.data.projects); })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load projects'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedHackathon, setSearchParams]);

  const selectProject = async (project) => {
    setSelected(project);
    setError('');
    setSuccess('');
    setValidationErrors([]);
    setScoreForm({ score: 5, feedback: '' });
    try {
      const response = await scoreAPI.getByProject(project.id);
      setScores(response.data.scores);
    } catch (requestError) {
      setScores([]);
      setError(requestError.response?.data?.message || 'Unable to load scores');
    }
  };

  const handleScore = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    setValidationErrors([]);
    try {
      await scoreAPI.submit({
        project_id: selected.id,
        score: Number(scoreForm.score),
        feedback: scoreForm.feedback,
      });
      setSuccess('Score submitted successfully!');
      const response = await scoreAPI.getByProject(selected.id);
      setScores(response.data.scores);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to submit score');
      setValidationErrors(requestError.response?.data?.errors || []);
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyScored = scores.some((score) => Number(score.judge_id) === Number(user.id));
  const selectedEvent = hackathons.find((event) => event.slug === selectedHackathon);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>⚖️ Judge Panel</h1>
          <p>Choose an event currently in judging, then review and score its projects.</p>
        </div>
        <div className="card judge-event-selector">
          <div className="form-group">
            <label htmlFor="judge-hackathon">Hackathon</label>
            <select id="judge-hackathon" value={selectedHackathon} onChange={(event) => setSelectedHackathon(event.target.value)} disabled={!hackathons.length}>
              {!hackathons.length && <option value="">No hackathons in judging</option>}
              {hackathons.map((event) => <option value={event.slug} key={event.id}>{event.title}</option>)}
            </select>
          </div>
          {selectedEvent && <HackathonPhaseBadge phase={selectedEvent.phase} />}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : !selectedHackathon ? (
          <div className="empty-state card"><div className="empty-icon">⚖️</div><h3>No hackathon is in judging right now</h3></div>
        ) : (
          <div className="judge-layout fade-in">
            <div className="projects-list-panel">
              <h3 className="panel-title">Projects ({projects.length})</h3>
              {projects.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📭</div><h3>No projects submitted</h3></div>
              ) : projects.map((project) => (
                <button key={project.id} type="button" className={`project-list-item ${selected?.id === project.id ? 'active' : ''}`} onClick={() => selectProject(project)}>
                  <div className="pli-title">{project.title}</div>
                  <div className="pli-team">{project.team_name}</div>
                  {project.avg_score > 0 && <div className="pli-score">⭐ {Number(project.avg_score).toFixed(1)}</div>}
                </button>
              ))}
            </div>

            <div className="score-panel">
              {!selected ? (
                <div className="empty-state" style={{ height: '100%' }}><div className="empty-icon">👈</div><h3>Select a project to score</h3><p>Click a project to review its details.</p></div>
              ) : (
                <div>
                  <div className="card" style={{ marginBottom: 20 }}>
                    <h2 className="project-title">{selected.title}</h2>
                    <p className="project-desc">{selected.description}</p>
                    <a href={selected.github_link} target="_blank" rel="noopener noreferrer" className="project-link">🔗 View on GitHub</a>
                    <div className="team-meta" style={{ marginTop: 16 }}>
                      <div className="meta-item"><span className="meta-label">Team</span><span className="meta-value">{selected.team_name}</span></div>
                      <div className="meta-item"><span className="meta-label">Scores received</span><span className="meta-value">{selected.score_count || 0}</span></div>
                    </div>
                  </div>
                  {error && <div className="alert alert-error">{error}</div>}
                  <ValidationErrors errors={validationErrors} />
                  {success && <div className="alert alert-success">{success}</div>}
                  {alreadyScored ? (
                    <div className="alert alert-success">You have already scored this project.</div>
                  ) : (
                    <div className="card">
                      <h3 className="card-title">Submit Your Score</h3>
                      <form onSubmit={handleScore}>
                        <div className="form-group">
                          <label>Score: <strong style={{ color: 'var(--primary-light)' }}>{scoreForm.score} / 10</strong></label>
                          <div className="score-value-display">{scoreForm.score}</div>
                          <input type="range" min="1" max="10" value={scoreForm.score} onChange={(event) => setScoreForm({ ...scoreForm, score: event.target.value })} className="score-slider" />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}><span>1 (Poor)</span><span>10 (Excellent)</span></div>
                        </div>
                        <div className="form-group">
                          <label>Feedback (optional)</label>
                          <textarea placeholder="Share your thoughts on this project..." value={scoreForm.feedback} onChange={(event) => setScoreForm({ ...scoreForm, feedback: event.target.value })} rows={3} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : '⭐ Submit Score'}</button>
                      </form>
                    </div>
                  )}
                  {scores.length > 0 && (
                    <div className="card" style={{ marginTop: 20 }}>
                      <h3 className="card-title">All Scores</h3>
                      <div className="members-list">
                        {scores.map((score) => (
                          <div className="member-item" key={score.id}>
                            <div className="member-avatar">{score.judge_name.charAt(0)}</div>
                            <div className="member-info"><span className="member-name">{score.judge_name}</span>{score.feedback && <span className="member-email">{score.feedback}</span>}</div>
                            <span className="score-badge" style={{ fontSize: 18 }}>{score.score}/10</span>
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
