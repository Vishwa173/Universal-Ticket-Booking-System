import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function Bookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/bookings/my', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        toast.error('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/bookings/cancel/${bookingId}`, {
        method: 'POST',
        credentials: 'include',
      });

      const result = await res.json();

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
        toast.success('Booking cancelled');
      } else {
        toast.error(result.message || 'Failed to cancel');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  if (loading) return <div className="text-gray-600">Loading your bookings...</div>;

  if (bookings.length === 0) return <div className="text-gray-500 mt-6">No bookings found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Toaster position="top-right" />
      <h2 className="text-3xl font-bold mb-8">My Bookings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-4 min-h-[260px] flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold capitalize mb-1">
                {booking.Event?.title || 'Untitled Event'}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                {new Date(booking.Event?.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Seats: {booking.bookedSeats?.join(', ') || 'N/A'}
              </p>
              <p
                className={`text-sm font-medium ${
                  booking.status === 'cancelled' ? 'text-red-500' : 'text-green-600'
                }`}
              >
                {booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}
              </p>
            </div>

            {booking.status !== 'cancelled' && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={() =>
                    window.open(`http://localhost:3000/tickets/booking-${booking.id}.pdf`, '_blank')
                  }
                  className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800"
                >
                  View Ticket
                </button>
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
