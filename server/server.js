require('dotenv').config();

// Process-level incident monitors for alerting
process.on('uncaughtException', (err) => {
  console.error(`[CRITICAL_MONITOR] ${new Date().toISOString()} - Uncaught Exception: ${err.stack || err}`);
  setTimeout(() => process.exit(1), 1000); // Give time for logs to flush before exiting
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`[CRITICAL_MONITOR] ${new Date().toISOString()} - Unhandled Rejection at:`, promise, `reason:`, reason);
});

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const initSocket = require('./sockets');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://monumental-yeot-3de97a.netlify.app',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

connectDB();

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/matchRoutes'));
app.use('/api', require('./routes/messageRoutes'));
app.use('/api', require('./routes/swapRoutes'));
app.use('/api', require('./routes/reviewRoutes'));
app.use('/api', require('./routes/userRoutes'));

app.get('/', (req, res) => res.send('SkillSwap API running'));

// Centralized error handling middleware for incident alerting
app.use((err, req, res, next) => {
  console.error(`[ERROR_MONITOR] ${new Date().toISOString()} - ${req.method} ${req.url} - ${err.stack || err}`);

  const errorResponse = {
    message: err.message || 'Internal Server Error'
  };

  // Redact stack trace in production mode to prevent information disclosure
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));