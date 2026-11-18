import React, { useEffect, useState } from 'react';
import { adminAPI, hackathonAPI } from '../services/api';
import ValidationErrors from './ValidationErrors';
import HackathonPhaseBadge from './HackathonPhaseBadge';

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  banner_url: '',
  registration_opens_at: '',
  registration_closes_at: '',
  starts_at: '',
  submission_deadline: '',
  judging_ends_at: '',
  max_team_size: 4,
};

const dateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const toPayload = (form) => ({
  ...form,
  banner_url: form.banner_url || null,
  max_team_size: Number(form.max_team_size),
  registration_opens_at: new Date(form.registration_opens_at).toISOString(),
  registration_closes_at: new Date(form.registration_closes_at).toISOString(),
  starts_at: new Date(form.starts_at).toISOString(),
  submission_deadline: new Date(form.submission_deadline).toISOString(),
  judging_ends_at: new Date(form.judging_ends_at).toISOString(),
});

export default function AdminHackathonsTab() {
  const [hackathons, setHackathons] = useState([]);
  const [stats, setStats] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [success, setSuccess] = useState('');

  const loadHackathons = async () => {
    setLoading(true);
    try {
      const response = await hackathonAPI.list({ limit: 100 });
      setHackathons(response.data.hackathons);
      const entries = await Promise.all(response.data.hackathons.map(async (event) => {
        const statsResponse = await adminAPI.getStats(event.id);
        return [event.id, statsResponse.data.stats];
      }));
      setStats(Object.fromEntries(entries));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHackathons(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setValidationErrors([]);
    setError('');
  };

  const editHackathon = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      slug: event.slug,
      description: event.description,
      banner_url: event.banner_url || '',
      registration_opens_at: dateInputValue(event.registration_opens_at),
      registration_closes_at: dateInputValue(event.registration_closes_at),
      starts_at: dateInputValue(event.starts_at),
      submission_deadline: dateInputValue(event.submission_deadline),
      judging_ends_at: dateInputValue(event.judging_ends_at),
      max_team_size: event.max_team_size,
    });
    setError('');
    setValidationErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveHackathon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    setValidationErrors([]);
    try {
      const payload = toPayload(form);
      if (editingId) await hackathonAPI.update(editingId, payload);
      else await hackathonAPI.create(payload);
      setSuccess(editingId ? 'Hackathon updated successfully.' : 'Hackathon created successfully.');
      resetForm();
      await loadHackathons();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save hackathon');
      setValidationErrors(requestError.response?.data?.errors || []);
    } finally {
      setSaving(false);
    }
  };

  const updateEvent = async (event, action) => {
    setError('');
    setSuccess('');
    try {
      await action();
      setSuccess(event.title + ' updated.');
      await loadHackathons();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update hackathon');
    }
  };

  const deleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.title}"?`)) return;
    try {
      await hackathonAPI.delete(event.id);
    } catch (requestError) {
      if (requestError.response?.status !== 409 || !window.confirm('This event has registrations. Force-delete all event data?')) {
        setError(requestError.response?.data?.message || 'Unable to delete hackathon');
        return;
      }
      try {
        await hackathonAPI.delete(event.id, true);
      } catch (forceError) {
        setError(forceError.response?.data?.message || 'Unable to delete hackathon');
        return;
      }
    }
    setSuccess('Hackathon deleted.');
    await loadHackathons();
  };

  const fields = [
    ['registration_opens_at', 'Registration opens'],
    ['registration_closes_at', 'Registration closes'],
    ['starts_at', 'Starts'],
    ['submission_deadline', 'Submission deadline'],
    ['judging_ends_at', 'Judging ends'],
  ];

  return (
    <div className="admin-hackathons">
      <div className="card admin-event-form-card">
        <h3 className="card-title">{editingId ? 'Edit Hackathon' : 'Create Hackathon'}</h3>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <ValidationErrors errors={validationErrors} />
        <form onSubmit={saveHackathon}>
          <div className="create-user-form">
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={200} />
            </div>
            <div className="form-group">
              <label>Slug (optional)</label>
              <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Generated from title if empty" />
            </div>
            <div className="form-group">
              <label>Banner URL (optional)</label>
              <input type="url" value={form.banner_url} onChange={(event) => setForm({ ...form, banner_url: event.target.value })} />
            </div>
            <div className="form-group">
              <label>Maximum team size *</label>
              <input type="number" min="1" max="10" value={form.max_team_size} onChange={(event) => setForm({ ...form, max_team_size: event.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} required />
          </div>
          <div className="admin-event-dates">
            {fields.map(([key, label]) => (
              <div className="form-group" key={key}>
                <label htmlFor={`event-${key}`}>{label} *</label>
                <input id={`event-${key}`} type="datetime-local" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required />
              </div>
            ))}
          </div>
          <div className="admin-event-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create hackathon'}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel edit</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">Hackathons ({hackathons.length})</h3>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : hackathons.length ? (
          <div className="admin-event-list">
            {hackathons.map((event) => (
              <article className="admin-event-item" key={event.id}>
                <div className="admin-event-main">
                  <div className="my-hackathon-heading">
                    <h3>{event.title}</h3>
                    <HackathonPhaseBadge phase={event.phase} />
                  </div>
                  <p>/{event.slug} · Starts {new Date(event.starts_at).toLocaleString()}</p>
                  <div className="admin-event-stats">
                    <span>{stats[event.id]?.registrations ?? event.registration_count} registrations</span>
                    <span>{stats[event.id]?.teams ?? event.team_count} teams</span>
                    <span>{stats[event.id]?.projects ?? 0} projects</span>
                    <span>{stats[event.id]?.scores ?? 0} scores</span>
                  </div>
                </div>
                <div className="admin-event-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => editHackathon(event)}>Edit</button>
                  <button className="btn btn-outline btn-sm" onClick={() => updateEvent(event, () => hackathonAPI.setPublished(event.id, !event.is_published))}>
                    {event.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={Date.now() < new Date(event.submission_deadline).getTime()}
                    onClick={() => updateEvent(event, () => hackathonAPI.setResultsPublished(event.id, !event.results_published_at))}
                  >
                    {event.results_published_at ? 'Unpublish results' : 'Publish results'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(event)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="empty-state"><h3>No hackathons created</h3></div>}
      </div>
    </div>
  );
}
