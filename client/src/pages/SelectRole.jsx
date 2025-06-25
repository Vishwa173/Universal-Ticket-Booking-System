import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SelectRole() {
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) return;

    const res = await fetch('http://localhost:3000/api/auth/set-role', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (res.ok) {
      if (role === 'vendor') navigate('/dashboard/vendor');
      else if (role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/user');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Universal Ticket Booking System
          </h1>
          <p className="text-sm text-center mb-6 text-gray-500">Choose how you'd like to use the platform</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              {['user', 'vendor', 'admin'].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center px-4 py-3 rounded-full bg-gray-100 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt}
                    checked={role === opt}
                    onChange={(e) => setRole(e.target.value)}
                    className="mr-3 accent-blue-500"
                  />
                  <span className="capitalize text-gray-800 font-medium">{opt}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold py-3 rounded-full hover:opacity-90 transition"
            >
              Confirm Role
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-teal-400 to-blue-500 text-white p-12">
        <div className="text-center max-w-sm">
          <h2 className="text-3xl font-bold mb-4">Set Your Role</h2>
          <p className="text-md">
            Choose your preferred mode to begin exploring bookings, managing listings, or handling admin tools.
          </p>
        </div>
      </div>
    </div>
  );
}
