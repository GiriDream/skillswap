const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createSwap,
  respondSwap,
  startSwap,
  confirmCompletion
} = require('../controllers/swapController');

router.post('/swap', protect, createSwap);
router.put('/swap/:id/respond', protect, respondSwap);
router.put('/swap/:id/start', protect, startSwap);
router.put('/swap/:id/confirm', protect, confirmCompletion);

module.exports = router;