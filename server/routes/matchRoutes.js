const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { updateLocation, getNearbyMatches } = require('../controllers/matchController');

router.put('/users/location', protect, updateLocation);
router.get('/match/nearby', protect, getNearbyMatches);

module.exports = router;