import Booking from '../models/booking.js';
import Event from '../models/event.js';
import User from '../models/user.js';
import { io } from '../server.js';

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Event,
          as: 'Event',
          attributes: ['title', 'date', 'banner'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const parsed = bookings.map((b) => ({
      ...b.toJSON(),
      bookedSeats:
        typeof b.bookedSeats === 'string'
          ? JSON.parse(b.bookedSeats)
          : b.bookedSeats,
    }));

    res.json({ bookings: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

export const cancelBooking = async (req, res) => {
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

    io.to(`event_${booking.eventId}`).emit('seats-updated', {
      eventId: booking.eventId,
      unbookedSeats: booking.bookedSeats,
    });

    res.json({ message: 'Booking cancelled and refund issued' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

export const getBookedSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const bookings = await Booking.findAll({
      where: { eventId, status: 'confirmed' },
    });

    const bookedSeats = bookings.flatMap((b) =>
      typeof b.bookedSeats === 'string' ? JSON.parse(b.bookedSeats) : b.bookedSeats
    );

    res.json(bookedSeats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch booked seats' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { eventId, userId, bookedSeats } = req.body;

    if (!Array.isArray(bookedSeats) || bookedSeats.length === 0) {
      return res.status(400).json({ message: 'No seats selected' });
    }

    const existingBookings = await Booking.findAll({
      where: { eventId, status: 'confirmed' },
    });

    const alreadyBooked = existingBookings.flatMap((b) =>
      typeof b.bookedSeats === 'string' ? JSON.parse(b.bookedSeats) : b.bookedSeats
    );

    const conflict = bookedSeats.some((seat) => alreadyBooked.includes(seat));
    if (conflict) {
      return res.status(409).json({ message: 'Some selected seats are already booked' });
    }

    const newBooking = await Booking.create({
      eventId,
      userId,
      bookedSeats,
      status: 'confirmed',
    });

    io.to(`event_${eventId}`).emit('seats-updated', {
      eventId,
      bookedSeats: bookedSeats,
    });

    res.status(201).json({ message: 'Booking successful', booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};
