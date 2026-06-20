const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skillsToTeach: [{ type: String }],
  skillsToLearn: [{ type: String }],
  credits: { type: Number, default: 5 },
  level: { type: String, default: 'Beginner' },
  badges: [{ type: String }],
  totalTeachingHours: { type: Number, default: 0 },
  profileImage: { type: String, default: '' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' }); // geo-query support

module.exports = mongoose.model('User', userSchema);