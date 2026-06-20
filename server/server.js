require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const initSocket = require('./sockets');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'https://monumental-yeot-3de97a.netlify.app' } });

// Capture console logs in memory for debugging
const logs = [];
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  logs.push(`[LOG] ${new Date().toISOString()}: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
  if (logs.length > 500) logs.shift();
  originalLog.apply(console, args);
};

console.error = (...args) => {
  logs.push(`[ERROR] ${new Date().toISOString()}: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
  if (logs.length > 500) logs.shift();
  originalError.apply(console, args);
};

connectDB();

app.use(cors({ origin: 'https://monumental-yeot-3de97a.netlify.app' }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/matchRoutes'));
app.use('/api', require('./routes/messageRoutes'));
app.use('/api', require('./routes/swapRoutes'));
app.use('/api', require('./routes/reviewRoutes'));
app.use('/api', require('./routes/userRoutes'));

app.get('/', (req, res) => res.send('SkillSwap API running (Commit: 826d817)'));
app.get('/debug-db', (req, res) => {
  const mongoose = require('mongoose');
  const redactedUri = process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'NOT_SET';
  res.json({
    mongoUri: redactedUri,
    connectionHost: mongoose.connection.host,
    dbName: mongoose.connection.db ? mongoose.connection.db.databaseName : 'N/A'
  });
});
app.get('/debug-logs', (req, res) => {
  res.send(logs.join('\n'));
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));