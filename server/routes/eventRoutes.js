import express from 'express';
import Event from '../models/event.js';
import {
  getAllEvents,
  getRecommendations,
  getDynamicPricing
} from '../controllers/eventController.js';

import { getBookedSeats } from '../controllers/bookingController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllEvents);

router.get('/recommendations', authenticateJWT, getRecommendations);

router.get('/:eventId/booked-seats', getBookedSeats);

router.get('/:id/dynamic-price', getDynamicPricing);

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
