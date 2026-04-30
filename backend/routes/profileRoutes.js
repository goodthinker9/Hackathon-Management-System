const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updatePassword, uploadAvatar } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
