const Message = require('../models/Message');

// @route GET /api/messages/:targetId
exports.getChatHistory = async (req, res) => {
  try {
    const myId = req.user.id;
    const { targetId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: targetId },
        { sender: targetId, receiver: myId }
      ]
    }).sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};