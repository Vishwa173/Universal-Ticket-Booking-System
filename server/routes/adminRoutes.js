import express from 'express';
import { Op } from 'sequelize';
import { authenticateJWT } from '../middleware/auth.js';

import Event from '../models/event.js';
import User from '../models/user.js';

const router = express.Router();

router.get('/events', authenticateJWT, async (req, res) => {
  try {
    const search = req.query.search || '';
    const events = await Event.findAll({
      where: {
        title: {
          [Op.iLike]: `%${search}%`,
        },
      },
      order: [['date', 'ASC']],
    });

    res.json(events);
  } catch (err) {
    console.error('Error fetching admin events:', err);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

router.put('/events/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, time, venue, description, category, bannerUrl } = req.body;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await event.update({ title, date, time, venue, description, category, bannerUrl });
    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

router.delete('/events/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

router.get('/users', authenticateJWT, async (req, res) => {
  try {
    const { search = '', role = 'user' } = req.query;

    const users = await User.findAll({
      where: {
        role,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (err) {
    console.error('Admin fetch users failed:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.post('/users/:id/ban', authenticateJWT, async (req, res) => {
  try {
    const { reason, duration } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    let banUntil = null;

    if (duration !== 'permanent') {
      const days = parseInt(duration);
      banUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    user.isBanned = true;
    user.banReason = reason;
    user.banUntil = banUntil;

    await user.save();

    res.json({ message: 'User banned successfully' });
  } catch (err) {
    console.error('Ban user failed:', err);
    res.status(500).json({ message: 'Failed to ban user' });
  }
});

router.post('/users/:id/unban', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBanned = false;
    user.banReason = null;
    user.banUntil = null;

    await user.save();

    res.json({ message: 'User unbanned successfully' });
  } catch (err) {
    console.error('Unban user failed:', err);
    res.status(500).json({ message: 'Failed to unban user' });
  }
});

export default router;
