import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import './HomePage.css';

const features = [
  {
    icon: 'shield',
    title: 'Secure Authentication',
    desc: 'JWT-based auth with role management for admins, judges, and participants.',
    gradient: 'linear-gradient(135deg, #6c63ff, #8b85ff)',
  },
  {
    icon: 'users',
    title: 'Team Management',
    desc: 'Create or join teams with unique invite codes. Collaborate seamlessly.',
    gradient: 'linear-gradient(135deg, #ff6584, #ff8fa3)',
  },
  {
    icon: 'rocket',
    title: 'Project Submission',
    desc: 'Submit your project with title, description, and GitHub repository link.',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
  },
  {
    icon: 'scale',
    title: 'Judge Scoring',
    desc: 'Judges score projects 1–10 with feedback. Duplicate scoring is prevented.',
    gradient: 'linear-gradient(135deg, #f7971e, #ffd200)',
  },
  {
    icon: 'trophy',
    title: 'Live Leaderboard',
    desc: 'Real-time rankings based on average scores from all judges.',
    gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  },
  {
    icon: 'settings',
    title: 'Admin Dashboard',
    desc: 'Full control over users, teams, projects, and scores in one place.',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
  },
];

const steps = [
  { num: '01', icon: 'clipboard', title: 'Register', desc: 'Create your account and join the hackathon as a participant.' },
  { num: '02', icon: 'users', title: 'Build a Team', desc: 'Create a team or join one using an invite code from your teammates.' },
  { num: '03', icon: 'laptop', title: 'Submit Project', desc: 'Build something amazing and submit your project with a GitHub link.' },
  { num: '04', icon: 'award', title: 'Get Scored', desc: 'Judges review and score your project. Climb the leaderboard!' },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-orb orb-1"></div>
          <div className="hero-orb orb-2"></div>
          <div className="hero-orb orb-3"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="hero-content container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Multiple hackathons. One platform.
          </div>

          <h1 className="hero-title">
            Build. Compete.
            <br />
            <span className="gradient-text">Win Together.</span>
          </h1>

          <p className="hero-subtitle">
            The ultimate platform to manage hackathons — from team formation and project
            submission to judging and live leaderboards. Everything in one place.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              <Icon name="rocket" size={19} /> Get Started Free
            </Link>
            <Link to="/hackathons" className="btn btn-outline btn-lg">
              <Icon name="zap" size={19} /> Explore Hackathons
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Participants</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">120+</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">30+</span>
              <span className="stat-label">Judges</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">$50K</span>
              <span className="stat-label">In Prizes</span>
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <div className="hero-visual">
          <div className="floating-card card-1">
            <span className="fc-icon"><Icon name="trophy" size={28} /></span>
            <div>
              <div className="fc-title">Team Alpha</div>
              <div className="fc-sub">Score: 9.4 / 10</div>
            </div>
          </div>
          <div className="floating-card card-2">
            <span className="fc-icon"><Icon name="rocket" size={28} /></span>
            <div>
              <div className="fc-title">Project Submitted!</div>
              <div className="fc-sub">AI Health Monitor</div>
            </div>
          </div>
          <div className="floating-card card-3">
            <span className="fc-icon"><Icon name="zap" size={28} /></span>
            <div>
              <div className="fc-title">New Score</div>
              <div className="fc-sub">Judge gave 10/10</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need to Run a Hackathon</h2>
            <p className="section-subtitle">
              A complete toolkit for organizers, participants, and judges — built for scale.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon" style={{ background: f.gradient }}>
                  <Icon name={f.icon} size={29} />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              From registration to results in four simple steps.
            </p>
          </div>

          <div className="steps-container">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <div className="step-card">
                  <div className="step-number">{step.num}</div>
                  <div className="step-icon"><Icon name={step.icon} size={40} /></div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
                {i < steps.length - 1 && <div className="step-arrow"><Icon name="chevronRight" size={27} /></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-orb"></div>
            <h2 className="cta-title">Ready to Hack?</h2>
            <p className="cta-subtitle">
              Join hundreds of developers building the future. Register now and start your journey.
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                <Icon name="rocket" size={19} /> Register Now
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Login to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-icon"><Icon name="zap" size={24} /></span>
              <span className="brand-text">HackHub</span>
              <p className="footer-tagline">The modern hackathon management platform.</p>
            </div>

            <div className="footer-links">
              <div className="footer-col">
                <h4>Platform</h4>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
                <Link to="/hackathons">Hackathons</Link>
              </div>
              <div className="footer-col">
                <h4>Features</h4>
                <a href="#features">Team Management</a>
                <a href="#features">Project Submission</a>
                <a href="#features">Judge Scoring</a>
              </div>
              <div className="footer-col">
                <h4>Info</h4>
                <a href="#how-it-works">How It Works</a>
                <a href="#features">About</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 HackHub. Built for hackathons everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
