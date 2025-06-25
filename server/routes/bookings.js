import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import Booking from '../models/booking.js';
import Event from '../models/event.js';
import User from '../models/user.js';
import { generatePDF } from '../utils/pdfGenerator.js';
import { sendTicketEmail } from '../utils/emailSender.js';
import { io } from '../server.js';

const router = express.Router();

router.post('/confirm', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId, selectedSeats } = req.body;

    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ message: 'No seats selected' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalPrice = event.price * selectedSeats.length;

    if (user.wallet < totalPrice) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    const existingBookings = await Booking.findAll({ where: { eventId, status: 'confirmed' } });
    const allBookedSeats = existingBookings.flatMap((b) =>
      typeof b.bookedSeats === 'string' ? JSON.parse(b.bookedSeats) : b.bookedSeats
    );
    const alreadyTaken = selectedSeats.filter((seat) => allBookedSeats.includes(seat));
    if (alreadyTaken.length > 0) {
      return res.status(409).json({
        message: 'Some seats already booked',
        seats: alreadyTaken,
      });
    }

    user.wallet -= totalPrice;
    await user.save();

    const booking = await Booking.create({
      userId,
      eventId,
      bookedSeats: selectedSeats,
      seatsCount: selectedSeats.length,
      totalPrice,
      status: 'confirmed',
    });

    if (event.availableSeats !== undefined) {
      event.availableSeats -= selectedSeats.length;
      await event.save();
    }

    const pdfPath = await generatePDF({
      user,
      event,
      seats: selectedSeats,
      bookingId: booking.id,
    });

    await sendTicketEmail({
      email: user.email,
      name: user.name,
      pdfPath,
    });

    io.to(`event_${eventId}`).emit('seats-updated', {
      eventId,
      bookedSeats: selectedSeats,
    });

    res.status(201).json({ message: 'Booking confirmed!', bookingId: booking.id });
  } catch (err) {
    console.error('Booking confirmation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/my', authenticateJWT, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: {
        model: Event,
        attributes: ['title', 'date', 'banner'],
      },
      order: [['createdAt', 'DESC']],
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      Event: {
        title: b.Event.title,
        date: b.Event.date,
        banner: b.Event.banner || null,
      },
      bookedSeats:
        typeof b.bookedSeats === 'string'
          ? JSON.parse(b.bookedSeats)
          : b.bookedSeats,
      status: b.status,
    }));

    res.json({ bookings: formatted });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/cancel/:bookingId', authenticateJWT, async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findByPk(bookingId);

    if (!booking || booking.status === 'cancelled') {
      return res.status(404).json({ message: 'Booking not found or already cancelled' });
    }

    const user = await User.findByPk(booking.userId);
    const event = await Event.findByPk(booking.eventId);

    const pricePerSeat = event.price || 20;
    const refundAmount = pricePerSeat * booking.bookedSeats.length;

    user.wallet += refundAmount;
    booking.status = 'cancelled';

    await user.save();
    await booking.save();

    io.to(`event_${event.id}`).emit('seats-updated', {
      eventId: event.id,
      unbookedSeats: booking.bookedSeats,
    });

    res.json({ message: 'Booking cancelled and refund issued' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/book/:eventId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.eventId;
    const { bookedSeats } = req.body;

    if (!Array.isArray(bookedSeats) || bookedSeats.length === 0) {
      return res.status(400).json({ message: 'No seats selected' });
    }

    const existingBookings = await Booking.findAll({ where: { eventId } });
    const allBookedSeats = existingBookings.flatMap((b) => b.bookedSeats || []);
    const alreadyTaken = bookedSeats.filter((seat) => allBookedSeats.includes(seat));
    if (alreadyTaken.length > 0) {
      return res.status(409).json({ message: 'Some seats are already booked', seats: alreadyTaken });
    }

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const totalPrice = event.price * bookedSeats.length;

    const booking = await Booking.create({
      userId,
      eventId,
      bookedSeats,
      seatsCount: bookedSeats.length,
      totalPrice,
      status: 'confirmed',
    });

    event.availableSeats -= bookedSeats.length;
    await event.save();

    res.status(201).json({
      message: 'Booking successful',
      booking: {
        ...booking.toJSON(),
        seats: booking.bookedSeats,
      },
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
