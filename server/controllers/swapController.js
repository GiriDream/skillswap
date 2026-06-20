const mongoose = require('mongoose');
const Swap = require('../models/Swap');
const User = require('../models/User');

// Badge thresholds based on totalTeachingHours
const getBadge = (hours) => {
  if (hours >= 30) return 'Gold Guru';
  if (hours >= 15) return 'Silver Guru';
  if (hours >= 5) return 'Bronze Tutor';
  return null;
};

// @route POST /api/swap
exports.createSwap = async (req, res) => {
  try {
    const { tutorId, skill, hours } = req.body;
    const swap = await Swap.create({
      tutor: tutorId,
      learner: req.user.id,
      skill,
      hours: hours || 1
    });
    res.status(201).json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/swap/:id/respond  body: { action: 'Accepted' | 'Declined' }
exports.respondSwap = async (req, res) => {
  try {
    const { action } = req.body;
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only the tutor can accept or decline a swap request
    if (swap.tutor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the tutor can accept or decline this swap request' });
    }

    swap.status = action;
    await swap.save();
    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/swap/:id/start  (Accepted -> Live)
exports.startSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only the tutor or the learner can start the session
    if (swap.tutor.toString() !== req.user.id && swap.learner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to start this session' });
    }

    // Credit validation to prevent double-spending/escrow-bypass
    const activeSwaps = await Swap.find({
      learner: swap.learner,
      status: 'Live',
      _id: { $ne: swap._id }
    });
    const activeHours = activeSwaps.reduce((sum, s) => sum + s.hours, 0);
    const learner = await User.findById(swap.learner);
    
    if (!learner) {
      return res.status(404).json({ message: 'Learner not found' });
    }
    
    if (learner.credits < activeHours + swap.hours) {
      return res.status(400).json({ message: 'Learner has insufficient credits to start this session' });
    }

    swap.status = 'Live';
    await swap.save();
    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/swap/:id/confirm  (both learner & tutor must call this)
exports.confirmCompletion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const swap = await Swap.findById(req.params.id).session(session);
    if (!swap) throw new Error('Swap not found');

    const isLearner = swap.learner.toString() === req.user.id;
    const isTutor = swap.tutor.toString() === req.user.id;

    if (!isLearner && !isTutor) {
      throw new Error('Unauthorized to confirm this session completion');
    }

    if (isLearner) swap.learnerConfirmed = true;
    if (isTutor) swap.tutorConfirmed = true;

    // Only run the credit transfer once BOTH confirm
    if (swap.learnerConfirmed && swap.tutorConfirmed && swap.status !== 'Completed') {
      const learner = await User.findById(swap.learner).session(session);
      const tutor = await User.findById(swap.tutor).session(session);

      if (!learner || !tutor) {
        throw new Error('Learner or tutor not found');
      }

      if (learner.credits < swap.hours) {
        throw new Error('Learner has insufficient credits');
      }

      learner.credits -= swap.hours;
      tutor.credits += swap.hours;
      tutor.totalTeachingHours += swap.hours;

      const newBadge = getBadge(tutor.totalTeachingHours);
      if (newBadge && !tutor.badges.includes(newBadge)) {
        tutor.badges.push(newBadge);
        tutor.level = newBadge;
      }

      await learner.save({ session });
      await tutor.save({ session });

      swap.status = 'Completed';
    }

    await swap.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json(swap);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};