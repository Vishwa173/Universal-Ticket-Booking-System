import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

import vendorRoutes from './routes/vendor.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/eventRoutes.js';
import Booking from './models/booking.js';
import Event from './models/event.js';
import bookingRoutes from './routes/bookings.js';
import razorpayRoutes from './routes/razorpay.js';
import { sendResetEmail } from './utils/emailSender.js';
import { generateToken } from './utils/jwt.js';
import adminRoutes from './routes/adminRoutes.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import sequelize from './config/database.js';
import User from './models/user.js';
import PasswordResetToken from './models/PasswordResetToken.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const IS_PROD = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getRedirectPathForRole(role) {
  switch (role) {
    case 'user':
      return '/dashboard/user';
    case 'vendor':
      return '/dashboard/vendor';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/';
  }
}

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/tickets', express.static(path.join(__dirname, 'tickets')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
export { io };

const socketSelectedSeats = new Map();

io.on('connection', (socket) => {

  socket.on('joinEventRoom', (eventId) => {
    socket.join(`event_${eventId}`);

    const allSelectedSeats = [];
    for (const [id, seats] of socketSelectedSeats) {
      if (id !== socket.id) {
        seats.forEach(seat => {
          allSelectedSeats.push(seat);
        });
      }
    }

    socket.emit('initialSelectedSeats', allSelectedSeats);
  });

  socket.on('seatUpdate', ({ eventId, seatNumber, status }) => {
    const room = `event_${eventId}`;
    let userSeats = socketSelectedSeats.get(socket.id) || new Set();

    if (status === 'selected') {
      userSeats.add(seatNumber);
    } else if (status === 'deselected') {
      userSeats.delete(seatNumber);
    }

    socketSelectedSeats.set(socket.id, userSeats);
    socket.to(room).emit('seatUpdate', { seatNumber, status });
  });

  function cleanupSelectedSeats() {
    const seats = socketSelectedSeats.get(socket.id);
    if (seats) {
      seats.forEach((seatNumber) => {
        socket.broadcast.emit('seatUpdate', { seatNumber, status: 'deselected' });
      });
      socketSelectedSeats.delete(socket.id);
    }
  }

  socket.on('leaveEventRoom', (eventId) => {
    cleanupSelectedSeats();
    socket.leave(`event_${eventId}`);
  });

  socket.on('disconnect', () => {
    cleanupSelectedSeats();
  });
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const cookieToken = req.cookies?.token;

  const token = headerToken || cookieToken;

  if (!token) {
    console.warn('No token provided');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    const user = await User.findByPk(decoded.id);
    if (user && user.isBanned && user.banUntil && new Date() > new Date(user.banUntil)) {
      user.isBanned = false;
      user.banUntil = null;
      user.banReason = null;
      await user.save();
    }

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user || user.role !== role || !user.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.isBanned) {
    const now = new Date();
    const banUntil = user.banUntil ? new Date(user.banUntil) : null;
    if (!banUntil || banUntil > now) {
      return res.status(403).json({
        message: `You are banned${user.banReason ? `: ${user.banReason}` : ''}${banUntil ? ` (until ${banUntil.toISOString().split('T')[0]})` : ''}`
      });
    }
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  const redirectPath = getRedirectPathForRole(user.role);

  res.cookie('token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'Lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.json({ message: 'Login successful', redirectPath });
});

app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/admin', adminRoutes);

User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(Booking, { foreignKey: 'eventId' });
Booking.belongsTo(Event, { foreignKey: 'eventId' });

app.get('/api/user/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'profilePic', 'wallet'],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}); 

app.put('/api/user/profile', authenticateJWT, upload.single('profilePic'), async (req, res) => {
  const { name, email } = req.body;
  const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name;
    user.email = email;
    if (profilePic) user.profilePic = profilePic;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/user/change-password', authenticateJWT, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password) {
      return res.status(400).json({ message: 'Password change not supported for OAuth users' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'Lax',
    path: '/',
  });

  res.json({ message: 'Logged out successfully' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

sequelize.sync({ alter: true })
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })