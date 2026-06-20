const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { createReview } = require('../controllers/reviewController');

router.post('/review', protect, createReview);

module.exports = router;