const jwt = require('jsonwebtoken');
const { HttpError } = require('./errorHandler');
const UserModel = require('../models/userModel');

const authenticate = (req, next, optional = false) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return optional ? next() : next(new HttpError(401, 'No token provided, unauthorized'));
  }

  const token = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new HttpError(401, 'Invalid or expired token'));
  }

  UserModel.findById(decoded.id)
    .then((user) => {
      if (!user) return next(new HttpError(401, 'User no longer exists'));
      req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
      return next();
    })
    .catch(next);
};

const protect = (req, _res, next) => authenticate(req, next);
const optionalProtect = (req, _res, next) => authenticate(req, next, true);

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Access denied: insufficient permissions'));
    }
    next();
  };
};

module.exports = { protect, optionalProtect, requireRole };
