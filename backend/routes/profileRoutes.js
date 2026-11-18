const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updatePassword, uploadAvatar } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const validate = require('../middleware/validate');
const {
  updateProfile: updateProfileSchema,
  updatePassword: updatePasswordSchema,
} = require('../validation/schemas');

router.get('/', protect, asyncHandler(getProfile));
router.put('/', protect, validate(updateProfileSchema), asyncHandler(updateProfile));
router.put('/password', protect, validate(updatePasswordSchema), asyncHandler(updatePassword));
router.post('/avatar', protect, upload.single('avatar'), asyncHandler(uploadAvatar));

module.exports = router;
