const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getChatHistory } = require('../controllers/messageController');

router.get('/messages/:targetId', protect, getChatHistory);

module.exports = router;