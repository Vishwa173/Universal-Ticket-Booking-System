import { useState, useEffect } from 'react';
import VendorSidebar from '../components/VendorSidebar';
import ProfileForm from '../components/ProfileForm';
import ChangePassword from './ChangePassword';
import Footer from '../components/Footer';
import Profile from './Profile';
import VendorEvents from './VendorEvents';

export default function VendorDashboard() {
  const [activePage, setActivePage] = useState('profile');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('http://localhost:3000/api/user/profile', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
        } else { 
          console.error('Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }

    fetchProfile();
  }, []);

  const renderPage = () => {
  switch (activePage) {
    case 'profile':
      return <Profile user={user} />;
    case 'password':
      return <ChangePassword user={user} />;
    case 'events':
      return <VendorEvents user={user} />;
    default:
      return <Profile user={user} />;
  }
};

  return (
        <div className="flex flex-col min-h-screen text-gray-800 bg-[linear-gradient(to_bottom,_#d6ccff_0%,_#ebe5ff_20%,_#ffffff_30%,_#ffffff_100%)]">
          <div className="flex flex-1">
            <VendorSidebar activePage={activePage} setActivePage={setActivePage} />
            <main className="flex-1 px-6 py-6">
                {renderPage()}
            </main>
          </div>      
          <Footer />
        </div>
  );
}