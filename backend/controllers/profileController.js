const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const UserModel = require('../models/userModel');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/profile  — update name & bio
const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    await UserModel.updateProfile(req.user.id, { name: name.trim(), bio });
    const user = await UserModel.findById(req.user.id);
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/profile/password  — change password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Fetch full user record (with password hash)
    const fullUser = await UserModel.findByEmail(req.user.email);
    const isMatch = await bcrypt.compare(currentPassword, fullUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(req.user.id, hashed);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/profile/avatar  — upload photo
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Delete old avatar file if it exists
    const existing = await UserModel.findById(req.user.id);
    if (existing.avatar) {
      const oldPath = path.join(__dirname, '../', existing.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Store relative path
    const avatarPath = `uploads/avatars/${req.file.filename}`;
    await UserModel.updateAvatar(req.user.id, avatarPath);

    const user = await UserModel.findById(req.user.id);
    res.json({ message: 'Avatar uploaded successfully', user });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, updatePassword, uploadAvatar };
