import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HackathonPhaseBadge from '../components/HackathonPhaseBadge';
import { useAuth } from '../context/AuthContext';
import { hackathonAPI } from '../services/api';
import './HackathonsPage.css';

const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export default function HackathonsPage() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [phase, setPhase] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await hackathonAPI.list({ search, phase: phase || undefined, page, limit: 9 });
        if (active) {
          setHackathons(response.data.hackathons);
          setPagination(response.data.pagination);
        }
      } catch {
        if (active) {
          setHackathons([]);
          setError('Unable to load hackathons. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [search, phase, page]);

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const updatePhase = (value) => {
    setPhase(value);
    setPage(1);
  };

  return (
    <div className="public-hackathons-page">
      <Navbar />
      <main className="hackathons-container">
        <header className="hackathons-heading">
          <div>
            <span className="section-tag">Find your next challenge</span>
            <h1>Hackathons</h1>
            <p>Explore events, build with a team, and share what you create.</p>
          </div>
          <div className="hackathon-filters">
            <input
              type="search"
              aria-label="Search hackathons"
              placeholder="Search hackathons..."
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
            />
            <select aria-label="Filter by phase" value={phase} onChange={(event) => updatePhase(event.target.value)}>
              <option value="">All phases</option>
              {user?.role === 'admin' && <option value="draft">Draft</option>}
              <option value="upcoming">Upcoming</option>
              <option value="registration">Registration</option>
              <option value="hacking">Hacking</option>
              <option value="judging">Judging</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : hackathons.length ? (
          <>
            <section className="hackathon-grid" aria-label="Hackathon results">
              {hackathons.map((hackathon) => (
                <article className="hackathon-card" key={hackathon.id}>
                  {hackathon.banner_url ? (
                    <img className="hackathon-banner" src={hackathon.banner_url} alt="" />
                  ) : error ? null : (
                    <div className="hackathon-banner-placeholder">⚡</div>
                  )}
                  <div className="hackathon-card-body">
                    <div className="hackathon-card-top">
                      <HackathonPhaseBadge phase={hackathon.phase} />
                      <span className="hackathon-date">{formatDate(hackathon.starts_at)}</span>
                    </div>
                    <h2>{hackathon.title}</h2>
                    <p className="hackathon-description">{hackathon.description}</p>
                    <div className="hackathon-card-meta">
                      <span>👥 {hackathon.registration_count} registered</span>
                      <span>🧩 {hackathon.team_count} teams</span>
                    </div>
                    <Link className="btn btn-primary btn-sm" to={`/hackathons/${encodeURIComponent(hackathon.slug)}`}>
                      View details
                    </Link>
                  </div>
                </article>
              ))}
            </section>
            <nav className="hackathon-pagination" aria-label="Hackathon pages">
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total} events</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </nav>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🧭</div>
            <h3>No hackathons found</h3>
            <p>Try changing the search or phase filter.</p>
          </div>
        )}
      </main>
    </div>
  );
}
