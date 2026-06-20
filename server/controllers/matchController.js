const User = require('../models/User');

// @route PUT /api/users/location
exports.updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { location: { type: 'Point', coordinates: [longitude, latitude] } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Location updated', location: user.location });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/match/nearby?radius=10&skill=React
exports.getNearbyMatches = async (req, res) => {
  try {
    const { radius = 10, skill } = req.query;
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.location || !currentUser.location.coordinates) {
      return res.status(400).json({ message: 'Set your location first' });
    }

    const radiusInMeters = radius * 1000;

    const skillFilter = skill
      ? { skillsToTeach: { $regex: skill, $options: 'i' } }
      : { skillsToTeach: { $in: currentUser.skillsToLearn } };

    const matches = await User.find({
      _id: { $ne: currentUser._id },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: currentUser.location.coordinates },
          $maxDistance: radiusInMeters
        }
      },
      ...skillFilter
    }).select('-password');

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};