import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import MovieSeatGrid from '../components/MovieSeatGrid';
import TrainSeatGrid from '../components/TrainSeatGrid';
import ConcertSeatGrid from '../components/ConcertSeatGrid';

const socket = io('http://localhost:3000', { withCredentials: true });

export default function SeatSelectionPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [takenSeatsFromOthers, setTakenSeatsFromOthers] = useState(new Set());
  const [bookedSeats, setBookedSeats] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/events`).then((res) => {
      const found = res.data.find((e) => e.id.toString() === eventId);
      setEvent(found);
    });
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    axios
      .get(`http://localhost:3000/api/events/${eventId}/booked-seats`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setBookedSeats(res.data);
        }
      })
      .catch((err) => console.error('Error fetching booked seats', err));
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    socket.emit('joinEventRoom', eventId);

    socket.on('initialSelectedSeats', (seats) => {
      setTakenSeatsFromOthers(new Set(seats));
    });

    socket.on('seatUpdate', ({ seatNumber, status }) => {
      setTakenSeatsFromOthers((prev) => {
        const updated = new Set(prev);
        if (status === 'selected') updated.add(seatNumber);
        else updated.delete(seatNumber);
        return updated;
      });
    });

    socket.on('seats-updated', ({ eventId: updatedEventId, bookedSeats: newBooked }) => {
      if (updatedEventId.toString() === eventId.toString()) {
        setBookedSeats((prev) => [...new Set([...prev, ...newBooked])]);
      }
    });

    return () => {
      socket.emit('leaveEventRoom', eventId);
      socket.off('initialSelectedSeats');
      socket.off('seatUpdate');
      socket.off('seats-updated');
    };
  }, [eventId]);

  const handleSelect = (seats) => {
    const newSeats = seats.filter((seat) => !selectedSeats.includes(seat));
    const removedSeats = selectedSeats.filter((seat) => !seats.includes(seat));

    newSeats.forEach((seat) =>
      socket.emit('seatUpdate', { eventId, seatNumber: seat, status: 'selected' })
    );
    removedSeats.forEach((seat) =>
      socket.emit('seatUpdate', { eventId, seatNumber: seat, status: 'deselected' })
    );

    setSelectedSeats(seats);
  };

  const handleConfirm = () => {
    navigate(`/ticket-summary`, {
      state: {
        event,
        selectedSeats,
        eventId,
      }
    });
  };

  if (!event) return <div className="p-6 text-center">Loading event...</div>;

  let GridComponent;
  const type = event.category.toLowerCase();
  if (type === 'movie') GridComponent = MovieSeatGrid;
  else if (type === 'train') GridComponent = TrainSeatGrid;
  else if (type === 'concert') GridComponent = ConcertSeatGrid;
  else return <div className="p-6 text-red-500">Unsupported event type</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-white shadow p-4 border-b flex justify-between items-center px-8">
        <h1 className="text-2xl font-bold tracking-widest text-black font-bebas">🎟️ OMNITIX</h1>
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold text-black font-bebas">{event.title}</h2>
          <p className="text-gray-600 mt-1 font-medium">
            {new Date(event.date).toLocaleDateString()} at {event.time}
          </p>
        </div>
        <div className="w-52"></div>
      </div>

      <div className="py-12 flex flex-col items-center px-4">
        <GridComponent
          eventId={eventId}
          onSelect={handleSelect}
          selectedSeats={selectedSeats}
          takenSeatsFromOthers={takenSeatsFromOthers}
          bookedSeats={bookedSeats}
        />

        <div className="mt-6">
          <p className="font-semibold">
            Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
          </p>
          <button
            onClick={handleConfirm}
            disabled={selectedSeats.length === 0}
            className="mt-4 px-6 py-2 bg-black text-white rounded font-semibold hover:opacity-90 disabled:opacity-40"
          >
            Confirm Selection
          </button>
        </div>
      </div>

      <div className="bg-white border-t p-4 flex justify-center gap-6 text-sm text-black font-semibold font-bebas">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-black rounded" /> Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded" /> Booked
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded" /> Live (Taken by others)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded" /> Selected
        </div>
      </div>
    </div>
  );
}
