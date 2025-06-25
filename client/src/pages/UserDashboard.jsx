import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Profile from './Profile';
import Bookings from './Bookings';
import ChangePassword from './ChangePassword';
import Events from './Events';
import Footer from '../components/Footer';

export default function UserDashboard() {
  const [activePage, setActivePage] = useState('profile');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/user/profile', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchProfile();
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'profile':
        return <Profile user={user} />;
      case 'bookings':
        return <Bookings user={user} />;
      case 'password':
        return <ChangePassword user={user} />;
      case 'events':
        return <Events user={user} />;
      default:
        return <Profile user={user} />;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#d6ccff] via-[#ebe5ff] via-30% to-white text-gray-600">
        <div className="text-xl font-medium animate-pulse">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-gray-800 bg-[linear-gradient(to_bottom,_#d6ccff_0%,_#ebe5ff_20%,_#ffffff_30%,_#ffffff_100%)]">
      <div className="flex flex-1">
        <div className="pt-16">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        </div>
        <main className="flex-1 px-6 py-6">
          {renderPage()}
        </main>
    </div>

      <Footer />
    </div>
  );
}
 