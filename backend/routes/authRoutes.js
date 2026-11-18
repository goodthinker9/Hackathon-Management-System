const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const { login: loginSchema, register: registerSchema } = require('../validation/schemas');
const rateLimit = require('express-rate-limit');

const createAuthLimiter = () => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ message: 'Too many authentication attempts', errors: [] }),
});

router.post('/register', createAuthLimiter(), validate(registerSchema), asyncHandler(register));
router.post('/login', createAuthLimiter(), validate(loginSchema), asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

module.exports = router;
