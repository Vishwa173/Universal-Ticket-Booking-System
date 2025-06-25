import { useEffect, useState } from 'react';
import VendorEventCard from '../components/VendorEventCard';
import toast, { Toaster } from 'react-hot-toast';
import { FaCamera } from 'react-icons/fa';

export default function VendorEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    price: '',
    availableSeats: '',
    banner: null,
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/vendor/events', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'banner') {
      const file = files[0];
      if (file && file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, banner: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });

    try {
      const res = await fetch('http://localhost:3000/api/vendor/events', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });

      if (res.ok) {
        toast.success('Event created!');
        setFormData({
          title: '',
          description: '',
          category: '',
          date: '',
          time: '',
          location: '',
          price: '',
          availableSeats: '',
          banner: null, 
        });
        fetchEvents();
      } else {
        const result = await res.json();
        toast.error(result.message || 'Event creation failed.');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Something went wrong.');
    }
  };

  const deleteEvent = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/vendor/events/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      toast.success('Event deleted.');
      fetchEvents();
    } else {
      toast.error('Failed to delete event.');
    }
  } catch (err) {
    console.error('Error deleting event:', err);
    toast.error('Error deleting event.');
  }
};

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <Toaster position="top-right" />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-xl space-y-6 border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800">Create New Event</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="title" placeholder="Title" required value={formData.title} onChange={handleChange}
            className="p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input name="category" placeholder="Category" required value={formData.category} onChange={handleChange}
            className="p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />

          <input name="date" type="date" required value={formData.date} onChange={handleChange}
            className="p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input name="time" type="time" required value={formData.time} onChange={handleChange}
            className="p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />

          <input name="location" placeholder="Location" required value={formData.location} onChange={handleChange}
            className="p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <input name="price" type="number" placeholder="Price" required value={formData.price} onChange={handleChange}
            className="p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <textarea name="description" placeholder="Description" required value={formData.description} onChange={handleChange}
          className="w-full p-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" />

        <div className="relative inline-block">
          <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer hover:underline">
            <FaCamera className="text-lg text-gray-700" />
            Upload Banner
            <input
              type="file"
              name="banner"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="absolute bottom-6 right-8">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold shadow transition"
          >
            Create Event
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800">Your Events</h3>
        {events.length === 0 ? (
          <p className="text-gray-600">No events listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {events.map((event) => (
              <VendorEventCard key={event.id} event={event} onDelete={deleteEvent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
