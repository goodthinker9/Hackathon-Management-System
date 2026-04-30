import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import './ProfilePage.css';

const AVATAR_BASE = 'http://localhost:5000';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user.name, bio: user.bio || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [avatarMsg, setAvatarMsg] = useState({ type: '', text: '' });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(
    user.avatar ? `${AVATAR_BASE}/${user.avatar}` : null
  );

  const fileInputRef = useRef(null);

  // ── Profile update ──────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);
    try {
      const res = await profileAPI.update(profileForm);
      updateUser(res.data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password change ─────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirm) {
      return setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
    }
    if (passwordForm.newPassword.length < 6) {
      return setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
    }

    setSavingPassword(true);
    try {
      await profileAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Avatar upload ───────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return setAvatarMsg({ type: 'error', text: 'Only JPG, PNG, GIF, or WebP images allowed' });
    }
    if (file.size > 2 * 1024 * 1024) {
      return setAvatarMsg({ type: 'error', text: 'Image must be under 2 MB' });
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setAvatarMsg({ type: '', text: '' });
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await profileAPI.uploadAvatar(formData);
      updateUser(res.data.user);
      setAvatarMsg({ type: 'success', text: 'Photo updated successfully!' });
    } catch (err) {
      setAvatarMsg({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
      setAvatarPreview(user.avatar ? `${AVATAR_BASE}/${user.avatar}` : null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>👤 My Profile</h1>
          <p>Manage your account information and security settings.</p>
        </div>

        <div className="profile-layout fade-in">
          {/* ── Left: Avatar card ── */}
          <div className="profile-avatar-card card">
            <div className="avatar-wrapper">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="avatar-img" />
              ) : (
                <div className="avatar-initials">{initials}</div>
              )}
              {uploadingAvatar && (
                <div className="avatar-overlay">
                  <div className="spinner" />
                </div>
              )}
            </div>

            <h2 className="profile-name">{user.name}</h2>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
            <p className="profile-email">{user.email}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />
            <button
              className="btn btn-outline"
              style={{ marginTop: 20, width: '100%' }}
              onClick={() => fileInputRef.current.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? '⏳ Uploading...' : '📷 Change Photo'}
            </button>

            {avatarMsg.text && (
              <div className={`alert alert-${avatarMsg.type}`} style={{ marginTop: 12 }}>
                {avatarMsg.text}
              </div>
            )}

            <div className="profile-meta">
              <div className="meta-row">
                <span className="meta-label">Member since</span>
                <span className="meta-value">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Forms ── */}
          <div className="profile-forms">
            {/* Update profile */}
            <div className="card">
              <h3 className="card-title">✏️ Edit Profile</h3>
              {profileMsg.text && (
                <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>
              )}
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Email cannot be changed
                  </small>
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    maxLength={300}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {profileForm.bio.length}/300 characters
                  </small>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="card">
              <h3 className="card-title">🔐 Change Password</h3>
              {passwordMsg.text && (
                <div className={`alert alert-${passwordMsg.type}`}>{passwordMsg.text}</div>
              )}
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password *</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password *</label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                {/* Password strength indicator */}
                {passwordForm.newPassword && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`strength-bar ${getStrength(passwordForm.newPassword) >= level ? 'active' : ''}`}
                          style={{ background: getStrengthColor(getStrength(passwordForm.newPassword)) }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: getStrengthColor(getStrength(passwordForm.newPassword)) }}>
                      {getStrengthLabel(getStrength(passwordForm.newPassword))}
                    </span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                  {savingPassword ? '⏳ Updating...' : '🔐 Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Password strength helpers
function getStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getStrengthColor(score) {
  return ['#ff6584', '#f7971e', '#ffd200', '#43e97b'][score - 1] || '#444';
}

function getStrengthLabel(score) {
  return ['Weak', 'Fair', 'Good', 'Strong'][score - 1] || '';
}
