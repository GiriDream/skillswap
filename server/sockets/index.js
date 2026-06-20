const Message = require('../models/Message');
const checkMessage = require('../middleware/aiAudit');

const onlineUsers = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('checkOnline', (userId, callback) => {
      callback(onlineUsers.has(userId));
    });

    socket.on('joinRoom', ({ userId, targetId }) => {
      const room = [userId, targetId].sort().join('_');
      socket.join(room);
    });

    socket.on('sendMessage', async ({ senderId, receiverId, text, senderName }) => {
      const room = [senderId, receiverId].sort().join('_');
      const { flagged, reason } = await checkMessage(text);

      const message = await Message.create({ sender: senderId, receiver: receiverId, text, flagged });

      io.to(room).emit('receiveMessage', message);

      if (flagged) {
        io.to(room).emit('contentWarning', {
          messageId: message._id,
          reason: reason || 'This message may violate platform policy (no cash transactions allowed).'
        });
      }

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newNotification', {
          type: 'message',
          fromId: senderId,
          fromName: senderName || 'Someone',
          preview: text.slice(0, 40)
        });
      }
    });

    socket.on('typing', ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join('_');
      socket.to(room).emit('userTyping', { senderId });
    });

    socket.on('stopTyping', ({ senderId, receiverId }) => {
      const room = [senderId, receiverId].sort().join('_');
      socket.to(room).emit('userStoppedTyping', { senderId });
    });

    socket.on('swapRequestSent', ({ tutorId, learnerId, swap, learnerName }) => {
      const room = [tutorId, learnerId].sort().join('_');
      io.to(room).emit('swapRequestReceived', swap);

      const tutorSocketId = onlineUsers.get(tutorId);
      if (tutorSocketId) {
        io.to(tutorSocketId).emit('newNotification', {
          type: 'swap_request',
          fromId: learnerId,
          fromName: learnerName || 'Someone',
          preview: `requested a swap: ${swap.skill}`
        });
      }
    });

    socket.on('swapStatusChanged', ({ tutorId, learnerId, swap }) => {
      const room = [tutorId, learnerId].sort().join('_');
      io.to(room).emit('swapStatusUpdated', swap);
    });

    socket.on('callReady', ({ targetId }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) io.to(targetSocketId).emit('callReady', { callerId: socket.userId });
    });

    socket.on('callUser', ({ targetId, offer, callerId }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) io.to(targetSocketId).emit('incomingCall', { offer, callerId });
    });

    socket.on('answerCall', ({ targetId, answer }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) io.to(targetSocketId).emit('callAnswered', { answer });
    });

    socket.on('iceCandidate', ({ targetId, candidate }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) io.to(targetSocketId).emit('iceCandidate', { candidate });
    });

    socket.on('endCall', ({ targetId }) => {
      const targetSocketId = onlineUsers.get(targetId);
      if (targetSocketId) io.to(targetSocketId).emit('endCall');
    });

    socket.on('notepadChange', ({ room, content }) => {
      socket.to(room).emit('notepadUpdated', content);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      }
    });
  });
};

module.exports = initSocket;