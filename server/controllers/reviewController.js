const Review = require('../models/Review');

// @route POST /api/review
exports.createReview = async (req, res) => {
  try {
    const { swapId, revieweeId, rating, comment } = req.body;
    const review = await Review.create({
      swap: swapId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};