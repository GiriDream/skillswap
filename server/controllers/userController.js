const User = require('../models/User');
const Swap = require('../models/Swap');
const Review = require('../models/Review');

const badgeThresholds = [
  { name: 'Bronze Tutor', hours: 5 },
  { name: 'Silver Guru', hours: 15 },
  { name: 'Gold Guru', hours: 30 }
];

// @route GET /api/users/stats
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const taughtCount = await Swap.countDocuments({ tutor: req.user.id, status: 'Completed' });
    const learntCount = await Swap.countDocuments({ learner: req.user.id, status: 'Completed' });
    const nextBadge = badgeThresholds.find((b) => user.totalTeachingHours < b.hours);

    res.json({
      name: user.name,
      credits: user.credits,
      totalTeachingHours: user.totalTeachingHours,
      level: user.level,
      badges: user.badges,
      taughtCount,
      learntCount,
      nextBadge: nextBadge || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, skillsToTeach, skillsToLearn } = req.body;

    const updateData = {
      name,
      skillsToTeach: skillsToTeach.split(',').map((s) => s.trim()),
      skillsToLearn: skillsToLearn.split(',').map((s) => s.trim())
    };

    if (req.file) updateData.profileImage = req.file.path;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/users/:id/profile
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name profileImage')
      .sort('-createdAt');

    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({ user, reviews, avgRating, reviewCount: reviews.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};