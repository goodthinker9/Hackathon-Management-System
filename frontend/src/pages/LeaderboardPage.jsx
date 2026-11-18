import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import { leaderboardAPI } from '../services/api';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardAPI.get()
      .then((res) => setLeaderboard(res.data.leaderboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="leaderboard-page">
      <Navbar />
      <div className="lb-hero">
        <div className="lb-hero-content container">
          <h1><Icon name="trophy" size={34} /> Leaderboard</h1>
          <p>Live rankings based on average judge scores</p>
        </div>
      </div>

      <div className="container lb-content">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="trophy" size={44} /></div>
            <h3>No scores yet</h3>
            <p>The leaderboard will appear once judges start scoring projects.</p>
            <Link to="/register" className="btn btn-primary" style={{ marginTop: 20 }}>
              Join the Hackathon
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {leaderboard.length >= 3 && (
              <div className="podium">
                <div className="podium-item podium-2">
                  <div className="podium-medal silver"><Icon name="medal" size={32} /></div>
                  <div className="podium-name">{leaderboard[1]?.team_name}</div>
                  <div className="podium-score">{leaderboard[1]?.avg_score}</div>
                  <div className="podium-bar bar-2"></div>
                </div>
                <div className="podium-item podium-1">
                  <div className="podium-crown"><Icon name="trophy" size={24} /></div>
                  <div className="podium-medal gold"><Icon name="medal" size={32} /></div>
                  <div className="podium-name">{leaderboard[0]?.team_name}</div>
                  <div className="podium-score">{leaderboard[0]?.avg_score}</div>
                  <div className="podium-bar bar-1"></div>
                </div>
                <div className="podium-item podium-3">
                  <div className="podium-medal bronze"><Icon name="medal" size={32} /></div>
                  <div className="podium-name">{leaderboard[2]?.team_name}</div>
                  <div className="podium-score">{leaderboard[2]?.avg_score}</div>
                  <div className="podium-bar bar-3"></div>
                </div>
              </div>
            )}

            {/* Full table */}
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Project</th>
                      <th>Team</th>
                      <th>Judges</th>
                      <th>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((item, i) => (
                      <tr key={item.id} className={`rank-${i + 1}`}>
                        <td>
                          <div className="rank-cell">
                            <span className="rank-num">#{i + 1}</span>
                            {i < 3 && <span className={`rank-medal rank-medal-${i + 1}`}><Icon name="medal" size={17} /></span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                          <a href={item.github_link} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, color: 'var(--primary-light)' }}>
                            GitHub →
                          </a>
                        </td>
                        <td>{item.team_name}</td>
                        <td>{item.judge_count}</td>
                        <td>
                          <div className="score-bar-wrap">
                            <div className="score-bar">
                              <div
                                className="score-bar-fill"
                                style={{ width: `${(item.avg_score / 10) * 100}%` }}
                              />
                            </div>
                            <span className="score-text">{item.avg_score || '—'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
