import React from 'react';
import toast from 'react-hot-toast';

export default function VendorEventCard({ event, onDelete }) {
  const handleDelete = () => {
    toast.custom((t) => (
      <div className="w-[280px] sm:w-[320px] bg-white rounded-xl shadow-lg p-4 text-gray-800 text-sm flex flex-col">
        <div className="text-center">
          <p className="font-medium">Delete Event</p>
          <p className="mt-1 text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{event.title}</span>?
          </p>
        </div>
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => {
              onDelete(event.id);
              toast.dismiss(t.id);
            }}
            className="px-4 py-1.5 rounded-md bg-red-600 text-white text-xs hover:bg-red-700 transition"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 rounded-md border border-gray-300 bg-white text-gray-800 text-xs hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="w-[192px] h-[343.6px] rounded-lg shadow-md overflow-hidden bg-white flex flex-col">
      {event.banner && (
        <img
          src={`http://localhost:3000${event.banner}`}
          alt={`${event.title} Banner`}
          className="w-full h-80 object-cover"
        />
      )}
      <div className="p-3 flex flex-col flex-grow justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{event.title}</h2>
          <p className="text-xs text-gray-600 mt-1 line-clamp-3">{event.description}</p>
        </div>
        <button
          onClick={handleDelete}
          className="mt-3 text-xs text-red-600 hover:text-red-800 self-end"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
