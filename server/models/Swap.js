const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  hours: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined', 'Live', 'Completed'],
    default: 'Pending'
  },
  learnerConfirmed: { type: Boolean, default: false },
  tutorConfirmed: { type: Boolean, default: false },
  scheduledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Swap', swapSchema);