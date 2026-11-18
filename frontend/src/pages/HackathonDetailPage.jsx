import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HackathonPhaseBadge from '../components/HackathonPhaseBadge';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { hackathonAPI, leaderboardAPI, projectAPI, teamAPI } from '../services/api';
import './HackathonsPage.css';

const dateTime = (date) => new Date(date).toLocaleString(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function getNextMilestone(hackathon, now) {
  const milestones = [
    ['Registration opens', hackathon.registration_opens_at],
    ['Registration closes', hackathon.registration_closes_at],
    ['Hacking begins', hackathon.starts_at],
    ['Submissions close', hackathon.submission_deadline],
    ['Judging ends', hackathon.judging_ends_at],
  ].map(([label, date]) => ({ label, date: new Date(date) }))
    .filter((milestone) => milestone.date > now)
    .sort((a, b) => a.date - b.date);
  return milestones[0];
}

function Countdown({ milestone, now }) {
  if (!milestone) return <p className="countdown-value">All scheduled milestones have passed.</p>;
  const seconds = Math.max(0, Math.floor((milestone.date - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return (
    <div className="countdown-value">
      <span>{milestone.label}</span>
      <strong>{days}d {hours}h {minutes}m {remainingSeconds}s</strong>
      <small>{dateTime(milestone.date)}</small>
    </div>
  );
}

export default function HackathonDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [tabData, setTabData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const nextMilestone = hackathon ? getNextMilestone(hackathon, now) : null;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    hackathonAPI.get(slug)
      .then((response) => {
        if (active) setHackathon(response.data.hackathon);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load this hackathon');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!hackathon || tab === 'Overview') {
      setTabData([]);
      return undefined;
    }
    let active = true;
    setTabLoading(true);
    const request = tab === 'Teams'
      ? teamAPI.getAllForHackathon(slug).then((response) => response.data.teams)
      : tab === 'Projects'
        ? projectAPI.getAllForHackathon(slug).then((response) => response.data.projects)
        : leaderboardAPI.getForHackathon(slug).then((response) => response.data.leaderboard);
    request.then((data) => {
      if (active) {
        setTabData(data);
        setActionError('');
      }
    }).catch((requestError) => {
      if (active) {
        setTabData([]);
        setActionError(requestError.response?.data?.message || `Unable to load ${tab.toLowerCase()}`);
      }
    }).finally(() => {
      if (active) setTabLoading(false);
    });
    return () => { active = false; };
  }, [hackathon, slug, tab]);

  const handleRegistration = async () => {
    setRegistering(true);
    setActionError('');
    try {
      if (hackathon.is_registered) await hackathonAPI.unregister(slug);
      else await hackathonAPI.register(slug);
      const response = await hackathonAPI.get(slug);
      setHackathon(response.data.hackathon);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || 'Unable to update registration');
    } finally {
      setRegistering(false);
    }
  };

  const tabs = ['Overview', 'Teams', 'Projects', 'Leaderboard'];
  const participant = user?.role === 'participant';
  const registrationOpen = hackathon
    && now >= new Date(hackathon.registration_opens_at)
    && now <= new Date(hackathon.registration_closes_at);

  return (
    <div className="public-hackathons-page">
      <Navbar />
      <main className="hackathons-container">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : error ? (
          <div className="empty-state"><h3>{error}</h3><Link to="/hackathons" className="btn btn-primary">Browse hackathons</Link></div>
        ) : hackathon ? (
          <>
            <Link to="/hackathons" className="back-link"><Icon name="arrowLeft" size={16} /> All hackathons</Link>
            <header className="hackathon-detail-header">
              {hackathon.banner_url && <img className="hackathon-detail-banner" src={hackathon.banner_url} alt="" />}
              <div className="hackathon-detail-title">
                <HackathonPhaseBadge phase={hackathon.phase} />
                <h1>{hackathon.title}</h1>
                <p>{hackathon.description}</p>
                <div className="hackathon-card-meta">
                  <span><Icon name="users" size={16} /> {hackathon.registration_count} registered</span>
                  <span><Icon name="puzzle" size={16} /> {hackathon.team_count} teams</span>
                  <span><Icon name="calendar" size={16} /> Starts {dateTime(hackathon.starts_at)}</span>
                </div>
                {participant && (
                  <div className="detail-actions">
                    <button
                      className={`btn ${hackathon.is_registered ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={registering || (!hackathon.is_registered && !registrationOpen) || (hackathon.is_registered && hackathon.is_in_team)}
                      onClick={handleRegistration}
                    >
                      {registering ? 'Please wait...' : hackathon.is_registered ? 'Unregister' : registrationOpen ? 'Register' : 'Registration closed'}
                    </button>
                    {hackathon.is_registered && hackathon.is_in_team && <span className="registration-note">You cannot unregister while in a team.</span>}
                    {!hackathon.is_registered && !registrationOpen && <span className="registration-note">Registration is open {dateTime(hackathon.registration_opens_at)}–{dateTime(hackathon.registration_closes_at)}.</span>}
                    {hackathon.is_registered && (
                      <>
                        <Link className="btn btn-outline" to={`/hackathons/${encodeURIComponent(slug)}/team`}>My team</Link>
                        <Link className="btn btn-outline" to={`/hackathons/${encodeURIComponent(slug)}/project`}>My project</Link>
                      </>
                    )}
                  </div>
                )}
                {!user && <Link className="btn btn-primary" to="/login">Log in to register</Link>}
                {actionError && <div className="alert alert-error detail-alert">{actionError}</div>}
              </div>
              <aside className="countdown-card">
                <span className="countdown-label">Next milestone</span>
                <Countdown milestone={nextMilestone} now={now} />
              </aside>
            </header>

            <div className="hackathon-tabs" role="tablist">
              {tabs.map((name) => (
                <button key={name} role="tab" aria-selected={tab === name} className={tab === name ? 'active' : ''} onClick={() => setTab(name)}>
                  {name}
                </button>
              ))}
            </div>
            <section className="hackathon-tab-panel">
              {tab === 'Overview' ? (
                <div className="milestone-grid">
                  {[
                    ['Registration opens', hackathon.registration_opens_at],
                    ['Registration closes', hackathon.registration_closes_at],
                    ['Hacking begins', hackathon.starts_at],
                    ['Submission deadline', hackathon.submission_deadline],
                    ['Judging ends', hackathon.judging_ends_at],
                  ].map(([label, date]) => (
                    <div className="milestone-item" key={label}>
                      <span>{label}</span><strong>{dateTime(date)}</strong>
                    </div>
                  ))}
                </div>
              ) : tabLoading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
              ) : actionError ? (
                <div className="empty-state"><h3>{actionError}</h3></div>
              ) : tabData.length ? (
                <div className="card">
                  {tab === 'Teams' && <div className="listing-grid">{tabData.map((item) => <article className="listing-card" key={item.id}><h3>{item.name}</h3><p>{item.description || 'No team description.'}</p><small>{item.member_count} members · led by {item.owner_name}</small></article>)}</div>}
                  {tab === 'Projects' && <div className="listing-grid">{tabData.map((item) => <article className="listing-card" key={item.id}><h3>{item.title}</h3><p>{item.description}</p>                  <a href={item.github_link} target="_blank" rel="noopener noreferrer">View on GitHub <Icon name="externalLink" size={15} /></a></article>)}</div>}
                  {tab === 'Leaderboard' && <div className="table-wrapper"><table><thead><tr><th>Rank</th><th>Project</th><th>Team</th><th>Average</th><th>Judges</th></tr></thead><tbody>{tabData.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td>{item.title}</td><td>{item.team_name}</td><td>{item.avg_score == null ? '—' : `${item.avg_score}/10`}</td><td>{item.judge_count}</td></tr>)}</tbody></table></div>}
                </div>
              ) : (
                <div className="empty-state"><div className="empty-icon"><Icon name={tab === 'Teams' ? 'users' : tab === 'Projects' ? 'rocket' : 'trophy'} size={44} /></div><h3>No {tab.toLowerCase()} to show yet</h3>{tab === 'Projects' && hackathon.phase !== 'hacking' && <p>Submissions open on {dateTime(hackathon.starts_at)}.</p>}</div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
