import { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../lib/socket';

const rows = ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];
const cols = Array.from({ length: 22 }, (_, i) => i + 1);

export default function MovieSeatGrid({ eventId, onSelect, selectedSeats, takenSeatsFromOthers }) {
  const [bookedSeats, setBookedSeats] = useState([]);

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

    const handleSeatsUpdated = (data) => {
      if (data.eventId === eventId && Array.isArray(data.bookedSeats)) {
        setBookedSeats((prev) => [...new Set([...prev, ...data.bookedSeats])]);
      }
    };

    socket.on('seats-updated', handleSeatsUpdated);

    return () => {
      socket.off('seats-updated', handleSeatsUpdated);
    };
  }, [eventId]);

  const toggleSeat = (seatNumber) => {
    const isSelected = selectedSeats.includes(seatNumber);
    const updated = isSelected
      ? selectedSeats.filter((seat) => seat !== seatNumber)
      : [...selectedSeats, seatNumber];

    socket.emit('seatUpdate', {
      eventId,
      seatNumber,
      status: isSelected ? 'deselected' : 'selected',
    });

    onSelect(updated);
  };

  const renderSeat = (seatNumber) => {
    const isBooked = bookedSeats.includes(seatNumber);
    const isSelected = selectedSeats.includes(seatNumber);
    const isTakenByOthers = takenSeatsFromOthers.has(seatNumber) && !isSelected;

    let base =
      'w-10 h-10 rounded text-sm font-bold font-bebas border flex items-center justify-center';
    let color = 'bg-white text-black border-black';

    if (isBooked) {
      color = 'bg-gray-400 text-white cursor-not-allowed border-none';
    } else if (isSelected) {
      color = 'bg-blue-600 text-white border-none';
    } else if (isTakenByOthers) {
      color = 'bg-yellow-500 text-white cursor-not-allowed border-none';
    }

    return (
      <button
        key={seatNumber}
        className={`${base} ${color}`}
        disabled={isBooked || isTakenByOthers}
        onClick={() => toggleSeat(seatNumber)}
      >
        {seatNumber}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-6xl mx-auto grid gap-4 grid-cols-[repeat(22,_minmax(0,_1fr))]">
      {rows.map((row) =>
        cols.map((col) => {
          const seatNumber = `${row}${col}`;
          return <div key={seatNumber}>{renderSeat(seatNumber)}</div>;
        })
      )}
    </div>
  );
}
