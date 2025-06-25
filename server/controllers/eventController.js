import Event from '../models/event.js';
import Booking from '../models/booking.js';
import { Op, fn, col, where as whereFn } from 'sequelize';

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        date: {
          [Op.gte]: new Date()
        }
      },
      order: [['date', 'ASC']]
    });

    const modifiedEvents = events.map(event => {
      const eventData = event.toJSON();
      if (eventData.banner) {
        eventData.banner = `http://localhost:3000/uploads/${eventData.banner}`;
      }
      return eventData;
    });

    res.status(200).json(modifiedEvents);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const userBookings = await Booking.findAll({
      where: { userId },
      include: { model: Event },
      order: [['createdAt', 'DESC']],
      raw: false
    });

    const categoryScores = {};
    const now = new Date();

    userBookings.forEach((booking) => {
      if (!booking.Event || !booking.createdAt) return;

      const category = booking.Event.category?.toLowerCase();
      const daysAgo = Math.floor((now - new Date(booking.createdAt)) / (1000 * 60 * 60 * 24));
      const recencyWeight = Math.max(0, 30 - daysAgo);

      if (!categoryScores[category]) {
        categoryScores[category] = { freq: 0, recency: 0 };
      }

      categoryScores[category].freq += 1;
      categoryScores[category].recency += recencyWeight;
    });

    const categoryPriority = Object.entries(categoryScores)
      .map(([category, { freq, recency }]) => ({
        category,
        score: freq * 2 + recency
      }))
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.category);

    const bookedEventIds = userBookings.map(b => b.eventId);
    let recommendedEvents = [];

    for (const category of categoryPriority) {
      const events = await Event.findAll({
        where: {
          [Op.and]: [
            whereFn(fn('LOWER', col('category')), category.toLowerCase()), 
            { date: { [Op.gte]: new Date() } }
          ]
        },
        order: [['date', 'ASC']],
      });

      events.forEach(event => {
        const base = categoryScores[category];
        const e = event.toJSON();
        e._score = base.freq * 2 + base.recency;
        recommendedEvents.push(e);
      });
    }

    recommendedEvents.sort((a, b) => b._score - a._score);

    recommendedEvents = recommendedEvents.map(e => {
      if (e.banner) {
        e.banner = `http://localhost:3000/uploads/${e.banner}`;
      }
      return e;
    });

    const recommendedIds = recommendedEvents.map(e => e.id);

    const otherEvents = await Event.findAll({
      where: {
        id: { [Op.notIn]: recommendedIds },
        date: { [Op.gte]: new Date() }
      },
      order: [['date', 'ASC']]
    });

    const others = otherEvents.map(e => {
      const obj = e.toJSON();
      if (obj.banner) {
        obj.banner = `http://localhost:3000/uploads/${obj.banner}`;
      }
      return obj;
    });

    res.status(200).json({
      recommended: recommendedEvents,
      others
    });

  } catch (err) {
    console.error('Error getting recommendations:', err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

export const getDynamicPricing = async (req, res) => {
  const PRICE_INCREMENT_PERCENT = 10;
  const THRESHOLD_PERCENT = 20;

  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const bookings = await Booking.findAll({
      where: { eventId, status: 'confirmed' }
    });

    const totalBooked = bookings.reduce((acc, b) => {
      const seats = typeof b.bookedSeats === 'string' ? JSON.parse(b.bookedSeats) : b.bookedSeats;
      return acc + seats.length;
    }, 0);

    const totalSeats = parseInt(event.totalSeats || 100);
    const percentSold = (totalBooked / totalSeats) * 100;
    const thresholdsCrossed = Math.floor(percentSold / THRESHOLD_PERCENT);

    const newPrice = Math.floor(event.price * (1 + (thresholdsCrossed * PRICE_INCREMENT_PERCENT / 100)));

    await event.update({ currentPrice: newPrice });

    res.json({ currentPrice: newPrice });
  } catch (err) {
    console.error('Error calculating dynamic price:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
