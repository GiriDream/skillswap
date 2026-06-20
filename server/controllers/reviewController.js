const Review = require('../models/Review');
const Swap = require('../models/Swap');

// @route POST /api/review
exports.createReview = async (req, res) => {
  try {
    const { swapId, revieweeId, rating, comment } = req.body;

    const swap = await Swap.findById(swapId);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.status !== 'Completed') {
      return res.status(400).json({ message: 'Cannot review a swap that is not completed' });
    }

    const isLearnerReviewingTutor = swap.learner.toString() === req.user.id && swap.tutor.toString() === revieweeId;
    const isTutorReviewingLearner = swap.tutor.toString() === req.user.id && swap.learner.toString() === revieweeId;

    if (!isLearnerReviewingTutor && !isTutorReviewingLearner) {
      return res.status(400).json({ message: 'Invalid reviewer/reviewee relationship for this swap' });
    }

    const existingReview = await Review.findOne({ swap: swapId, reviewer: req.user.id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this session' });
    }

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