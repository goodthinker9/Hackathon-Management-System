const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const { HttpError } = require('../middleware/errorHandler');

const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await UserModel.findByEmail(email);
  if (existing) throw new HttpError(409, 'Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role: 'participant',
  });
  const user = await UserModel.findById(userId);
  res.status(201).json({ message: 'Registration successful', token: generateToken(user), user });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const { password: _password, ...safeUser } = user;
  res.json({ message: 'Login successful', token: generateToken(user), user: safeUser });
};

const getMe = async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ user });
};

module.exports = { register, login, getMe };
