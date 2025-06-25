import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function TicketSummary() {
  const location = useLocation();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [eventId, setEventId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [wallet, setWallet] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }
    const { selectedSeats, eventId } = location.state;
    if (!selectedSeats || !eventId) {
      navigate('/');
      return;
    }
    setSelectedSeats(selectedSeats);
    setEventId(eventId);
  }, [location.state, navigate]);

  useEffect(() => {
  if (!eventId) return;

  axios
    .get(`http://localhost:3000/api/events/${eventId}/dynamic-price`)
    .then(() => {
      return axios.get(`http://localhost:3000/api/events/${eventId}`);
    })
    .then((res) => {
      setEvent(res.data);
    })
    .catch((err) => {
      console.error('Failed to fetch latest event data', err);
      toast.error('Could not load event info');
    });
}, [eventId]);


  useEffect(() => {
    axios
      .get('http://localhost:3000/api/user/profile', { withCredentials: true })
      .then((res) => {
        setUserEmail(res.data.email);
        setWallet(res.data.wallet || 0);
      })
      .catch((err) => console.error('Failed to fetch user email', err));
  }, []);

  const { pricePerTicket, totalPrice, taxes, grandTotal } = useMemo(() => {
    const pricePerTicket = event?.currentPrice || event?.price || 0;
    const totalPrice = pricePerTicket * selectedSeats.length;
    const taxes = (totalPrice * 0.18).toFixed(2);
    const grandTotal = (totalPrice + parseFloat(taxes)).toFixed(2);
    return { pricePerTicket, totalPrice, taxes, grandTotal };
  }, [event, selectedSeats]);

  if (!event) {
    return <div className="p-6 text-center text-black">Loading ticket summary...</div>;
  }

  const confirmBooking = async (paymentId = 'wallet') => {
    try {
      const res = await fetch('http://localhost:3000/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId, selectedSeats, paymentId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Booking confirmed! Ticket emailed.');
        setTimeout(() => {
          navigate('/dashboard/user');
        }, 1500);
      } else {
        toast.error(data.message || 'Booking failed.');
      }
    } catch (err) {
      toast.error('Booking error.');
    }
  };

  const payWithWallet = async () => {
    if (wallet < parseFloat(grandTotal)) {
      toast.error('Insufficient wallet balance');
      return;
    }
    toast.loading('Processing wallet payment...');
    await confirmBooking();
    toast.dismiss();
  };

  const payWithRazorpay = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: grandTotal * 100 }),
      });
      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'OmniTix',
        description: event.title,
        order_id: order.id,
        handler: function (response) {
          confirmBooking(response.razorpay_payment_id);
        },
        prefill: {
          name: 'Test User',
          email: userEmail,
        },
        theme: { color: '#000' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Failed to initiate Razorpay payment');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <Toaster position="top-right" />
      <div className="bg-white shadow p-4 border-b flex justify-between items-center px-8">
        <h1 className="text-2xl font-bold tracking-widest text-black font-bebas">🎟️ OMNITIX</h1>
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold text-black font-bebas">Review your booking</h2>
        </div>
        <div className="w-52" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8 py-10 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4">
            <img src={event.banner} alt={event.title} className="w-24 h-32 object-cover rounded-md shadow" />
            <div>
              <h3 className="text-2xl font-bold">{event.title}</h3>
              <p className="text-sm text-gray-700">{event.description}</p>
              <p className="text-sm text-gray-700">{event.location}</p>
            </div>
          </div>

          <div className="p-4 border rounded space-y-2">
            <p><strong>{new Date(event.date).toDateString()}</strong> at <strong>{event.time}</strong></p>
            <p className="font-medium">{selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''} – {selectedSeats.join(', ')}</p>
            <p className="text-right font-semibold">₹{totalPrice}</p>
          </div>

          <div className="p-4 bg-gray-100 text-gray-600 text-sm rounded-md">✅ This vendor allows cancellation</div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Offers</h4>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <p className="font-medium">Flat ₹50 OFF</p>
                <p className="text-sm text-gray-600">Save ₹50 with this code</p>
              </div>
              <button className="px-4 py-1 border rounded-md hover:bg-black hover:text-white transition text-white">Apply</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border rounded-md space-y-2">
            <h4 className="text-lg font-semibold mb-2">Payment summary</h4>
            <div className="flex justify-between"><span>Order amount</span><span>₹{totalPrice}</span></div>
            <div className="flex justify-between"><span>Taxes & fees</span><span>₹{taxes}</span></div>
            <hr />
            <div className="flex justify-between font-semibold"><span>To be paid</span><span>₹{grandTotal}</span></div>
          </div>

          <div className="p-4 border rounded-md">
            <h4 className="text-lg font-semibold mb-2">Your details</h4>
            <p className="text-sm">{userEmail}</p>
            <p className="text-sm mt-1 text-green-700">Wallet: ₹{wallet}</p>
          </div>

          <div className="p-4 border rounded-md">
            <h4 className="text-lg font-semibold mb-2">Terms and conditions</h4>
            <p className="text-sm text-gray-600">By continuing, you agree to our terms and conditions.</p>
          </div>

          <div className="p-4 border rounded-md">
            <div className="flex justify-between font-bold text-lg mb-3">
              <span>₹{grandTotal}</span>
              <span>TOTAL</span>
            </div>
            <button
              onClick={() => setShowOptions(true)}
              className="w-full bg-black text-white py-3 rounded font-semibold text-lg hover:opacity-90 transition"
            >
              Proceed To Pay
            </button>
          </div>
        </div>
      </div>

      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96 space-y-6 border border-gray-200">
            <h2 className="text-xl font-bold text-center text-black">Choose Payment Method</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowOptions(false); payWithWallet(); }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl font-semibold transition"
              >
                Pay with Wallet (₹{wallet})
              </button>
              <button
                onClick={() => { setShowOptions(false); payWithRazorpay(); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold transition"
              >
                Pay with Razorpay
              </button>
              <button
                onClick={() => setShowOptions(false)}
                className="w-full py-2 text-sm text-white hover:text-white transition text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
