import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaLock,
  FaTicketAlt,
  FaBars,
  FaSearch,
  FaSignOutAlt,
} from 'react-icons/fa';

export default function Sidebar({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        navigate('/');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const navItems = [
    { label: 'Profile', icon: <FaUser />, key: 'profile' },
    { label: 'My Bookings', icon: <FaTicketAlt />, key: 'bookings' },
    { label: 'Change Password', icon: <FaLock />, key: 'password' },
    { label: 'Events', icon: <FaSearch />, key: 'events' },
  ];

  return (
    <div
      className={`transition-all duration-300 ease-in-out h-screen flex flex-col font-sans ${
        collapsed ? 'w-16' : 'w-64'
      } bg-transparent text-gray-600 sticky top-0 shrink-0`}
    >
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        {!collapsed && (
          <h2 className="text-xl font-semibold text-gray-700">User Panel</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition duration-300 text-gray-700"
        >
          <FaBars />
        </button>
      </div>

      <nav className="flex-1 mt-2">
        {navItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setActivePage(item.key)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 rounded-r-full mx-2 my-1 ${
              activePage === item.key
                ? 'bg-white text-gray-900 font-medium shadow-md'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span className="text-base">{item.label}</span>}
          </div>
        ))}

        <div
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 rounded-r-full mx-2 my-1 hover:bg-red-100 text-red-600"
        >
          <span className="text-lg">
            <FaSignOutAlt />
          </span>
          {!collapsed && <span className="text-base">Sign Out</span>}
        </div>
      </nav>
    </div>
  );
}
