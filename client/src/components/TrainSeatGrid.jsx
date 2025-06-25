import { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../lib/socket';

const compartments = ['A', 'B', 'C', 'D'];
const seatsPerCompartment = [1, 2, 3, 4];

export default function TrainSeatGrid({
  eventId,
  onSelect,
  selectedSeats,
  takenSeatsFromOthers
}) {
  const [bookedSeats, setBookedSeats] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/events/${eventId}/booked-seats`)
      .then((res) => {
        if (Array.isArray(res.data)) setBookedSeats(res.data);
      })
      .catch((err) => console.error('Error fetching booked seats', err));
  }, [eventId]);

  const toggleSeat = (seatNumber) => {
    const isSelected = selectedSeats.includes(seatNumber);
    const updated = isSelected
      ? selectedSeats.filter((s) => s !== seatNumber)
      : [...selectedSeats, seatNumber];

    socket.emit('seatUpdate', {
      eventId,
      seatNumber,
      status: isSelected ? 'deselected' : 'selected'
    });

    onSelect(updated);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 px-8 py-6 w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
      {compartments.map((comp) => (
        <div key={comp} className="p-4 border rounded-lg shadow-sm">
          <p className="text-lg font-bebas font-bold text-black text-center mb-4">
            Compartment {comp}
          </p>
          <div className="grid grid-cols-2 gap-4 justify-items-center">
            {seatsPerCompartment.map((num) => {
              const seatNumber = `${comp}${num}`;
              const isBooked = bookedSeats.includes(seatNumber);
              const isTakenByOthers =
                takenSeatsFromOthers.has(seatNumber) &&
                !selectedSeats.includes(seatNumber);
              const isSelected = selectedSeats.includes(seatNumber);

              let base =
                'w-10 h-10 rounded text-sm font-bold font-bebas border flex items-center justify-center';
              let color = 'bg-white text-black border-black';

              if (isBooked)
                color =
                  'bg-gray-400 text-white cursor-not-allowed border-none';
              else if (isTakenByOthers)
                color =
                  'bg-yellow-500 text-white cursor-not-allowed border-none';
              else if (isSelected)
                color = 'bg-blue-600 text-white border-none';

              return (
                <button
                  key={seatNumber}
                  disabled={isBooked || isTakenByOthers}
                  onClick={() => toggleSeat(seatNumber)}
                  className={`${base} ${color}`}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
