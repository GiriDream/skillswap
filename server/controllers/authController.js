const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const buildUserResponse = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  credits: user.credits,
  skillsToTeach: user.skillsToTeach,
  skillsToLearn: user.skillsToLearn,
  profileImage: user.profileImage,
  totalTeachingHours: user.totalTeachingHours,
  badges: user.badges,
  level: user.level,
  token
});

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, skillsToTeach, skillsToLearn } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      skillsToTeach,
      skillsToLearn
    });

    res.status(201).json(buildUserResponse(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json(buildUserResponse(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};