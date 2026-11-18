const jwt = require('jsonwebtoken');
const { HttpError } = require('./errorHandler');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new HttpError(401, 'No token provided, unauthorized'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Access denied: insufficient permissions'));
    }
    next();
  };
};

module.exports = { protect, requireRole };
