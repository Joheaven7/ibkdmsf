const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.set('io', io);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' }));
app.use(express.json({ limit: '10mb' }));
app.use(mongoSanitize());
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

io.use((socket, next) => {
  try {
    const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    socket.userId = decoded.id; socket.userRole = decoded.role; next();
  } catch (err) { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
  console.log(`Socket: ${socket.id} | User: ${socket.userId} | Role: ${socket.userRole}`);
  socket.join(`user_${socket.userId}`);
  if (['clerk', 'admin'].includes(socket.userRole)) socket.join('staff');
  if (socket.userRole === 'superadmin') socket.join('superadmin');
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try { await mongoose.connect(process.env.MONGO_URI); console.log('MongoDB connected'); return; }
    catch (err) { if (i === retries - 1) throw err; await new Promise(r => setTimeout(r, 2000 * (i + 1))); }
  }
};

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) { console.error('❌ FATAL: JWT_SECRET must be >= 32 chars'); process.exit(1); }

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 15 : 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/api/auth', authLimiter, require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/residents', require('./src/routes/residentRoutes'));
app.use('/api/requests', require('./src/routes/requestRoutes'));
app.use('/api/certificates', require('./src/routes/certificateRoutes'));
app.use('/api/vital-events', require('./src/routes/vitalEventRoutes'));
app.use('/api/marriages', require('./src/routes/marriageRoutes'));
app.use('/api/divorces', require('./src/routes/divorceRoutes'));
app.use('/api/migrations', require('./src/routes/migrationRoutes'));
app.use('/api/stats', require('./src/routes/statsRoutes'));
app.use('/api/audit', require('./src/routes/auditRoutes'));
app.use('/api/settings', require('./src/routes/settingsRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'ok' : 'error';
  res.json({ status: dbStatus === 'ok' ? 'ok' : 'degraded', db: dbStatus, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server on port ${PORT}`);
    console.log(`📡 WebSocket active`);
    console.log(`🔒 JWT: OK`);
  });
}).catch(err => { console.error('Failed to start:', err); process.exit(1); });

module.exports = { app, io };