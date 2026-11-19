const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const UserModel = require('../models/userModel');
const { HttpError } = require('../middleware/errorHandler');

const getProfile = async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ user });
};

const updateProfile = async (req, res) => {
  const { name, bio, skills, github_url } = req.body;
  await UserModel.updateProfile(req.user.id, { name, bio, skills, github_url });
  const user = await UserModel.findById(req.user.id);
  res.json({ message: 'Profile updated successfully', user });
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new HttpError(400, 'Current password and a new password of at least 6 characters are required');
  }

  const fullUser = await UserModel.findByEmail(req.user.email);
  if (!fullUser || !(await bcrypt.compare(currentPassword, fullUser.password))) {
    throw new HttpError(401, 'Current password is incorrect');
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await UserModel.updatePassword(req.user.id, hashed);
  res.json({ message: 'Password changed successfully' });
};

const uploadAvatar = async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No image file provided');

  const existing = await UserModel.findById(req.user.id);
  if (existing && existing.avatar) {
    const oldPath = path.join(__dirname, '../', existing.avatar);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const avatarPath = `uploads/avatars/${req.file.filename}`;
  await UserModel.updateAvatar(req.user.id, avatarPath);
  const user = await UserModel.findById(req.user.id);
  res.json({ message: 'Avatar uploaded successfully', user });
};

module.exports = { getProfile, updateProfile, updatePassword, uploadAvatar };
