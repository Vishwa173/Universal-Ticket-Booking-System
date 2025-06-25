import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { authenticateJWT } from '../middleware/auth.js';
import Event from '../models/event.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.get('/events', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const events = await Event.findAll({
      where: { vendorId: req.user.id },
    });

    const updatedEvents = events.map(event => ({
      ...event.toJSON(),
      banner: event.banner ? `/uploads/${event.banner}` : null,
    }));

    res.json(updatedEvents);
  } catch (err) {
    console.error('Error fetching vendor events:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/events', authenticateJWT, upload.single('banner'), async (req, res) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Forbidden: Only vendors can create events' });
    }

    const {
      title,
      description,
      category,
      date,
      time,
      location,
      price
    } = req.body;

    if (!title || !description || !date || !location || !time || !category || !price) {
      return res.status(400).json({ message: 'Missing required event fields' });
    }

    let totalSeats;
    switch (category.toLowerCase()) {
      case 'train':
        totalSeats = 16;
        break;
      case 'concert':
        totalSeats = 80;
        break;
      case 'movie':
        totalSeats = 220;
        break;
      default:
        totalSeats = 100;
    }

    const banner = req.file ? req.file.filename : null;

    const newEvent = await Event.create({
      title,
      description,
      category,
      date,
      time,
      location,
      price,
      currentPrice: price,
      totalSeats,
      availableSeats: totalSeats,
      banner,
      vendorId: req.user.id,
    });

    const fullEvent = {
      ...newEvent.toJSON(),
      banner: banner ? `/uploads/${banner}` : null
    };

    res.status(201).json({ message: 'Event created successfully', event: fullEvent });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/events/:id', authenticateJWT, async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findOne({ where: { id: eventId, vendorId: req.user.id } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    if (event.banner) {
      const bannerPath = path.join('uploads', event.banner);
      if (fs.existsSync(bannerPath)) {
        fs.unlinkSync(bannerPath);
      }
    }

    await event.destroy();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
