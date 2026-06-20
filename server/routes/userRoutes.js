const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getStats, updateProfile, getPublicProfile } = require('../controllers/userController');

router.get('/users/stats', protect, getStats);
router.put('/users/profile', protect, upload.single('profileImage'), updateProfile);
router.get('/users/:id/profile', protect, getPublicProfile);

module.exports = router;