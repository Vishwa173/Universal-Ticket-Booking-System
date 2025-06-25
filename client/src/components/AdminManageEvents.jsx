import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminManageEvents() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deletePendingId, setDeletePendingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [searchTerm]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/events?search=${searchTerm}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleEditClick = (event) => {
    setEditingEventId(event.id);
    setEditFormData({ ...event });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/api/admin/events/${editingEventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        toast.success('Event updated');
        setEditingEventId(null);
        fetchEvents();
      } else {
        const result = await res.json();
        toast.error(result.message || 'Update failed');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Something went wrong');
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/events/${deletePendingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('Event deleted');
        fetchEvents();
      } else {
        const result = await res.json();
        toast.error(result.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Something went wrong');
    } finally {
      setDeletePendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Manage Events</h2>

      <input
        type="text"
        placeholder="Search by title..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
      />

      <div className="grid gap-4 mt-6">
        {events.length === 0 && (
          <p className="text-gray-500 italic">No events found.</p>
        )}

        {events.map((event) =>
          editingEventId === event.id ? (
            <form
              key={event.id}
              onSubmit={handleEditSubmit}
              className="bg-white shadow p-4 rounded-xl space-y-4"
            >
              <input
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                className="w-full p-2 border rounded bg-white"
                required
              />
              <input
                type="date"
                name="date"
                value={editFormData.date?.substring(0, 10)}
                onChange={handleEditChange}
                className="w-full p-2 border rounded bg-white"
              />
              <input
                type="time"
                name="time"
                value={editFormData.time}
                onChange={handleEditChange}
                className="w-full p-2 border rounded bg-white"
              />
              <input
                type="number"
                name="currentPrice"
                value={editFormData.currentPrice}
                onChange={handleEditChange}
                className="w-full p-2 border rounded bg-white"
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEventId(null)}
                  className="text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div
              key={event.id}
              className="bg-white shadow p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  {event.date?.substring(0, 10)} at {event.time}
                </p>
                <p className="text-sm text-gray-600">
                  ₹{event.currentPrice}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleEditClick(event)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletePendingId(event.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>

              {deletePendingId === event.id && (
                <div className="mt-4 w-full bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                  <p className="text-red-700 text-sm font-medium">Are you sure you want to delete this event?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={confirmDelete}
                      className="bg-red-600 text-white px-4 py-1 rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeletePendingId(null)}
                      className="text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
