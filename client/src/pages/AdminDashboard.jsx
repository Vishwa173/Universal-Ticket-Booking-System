import { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Footer from '../components/Footer';
import ProfileForm from '../components/ProfileForm';
import ChangePassword from './ChangePassword';
import AdminManageEvents from '../components/AdminManageEvents';
import AdminManageUsers from '../components/AdminManageUsers';

export default function AdminDashboard() {
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
        console.error('Error fetching admin:', err);
      }
    };

    fetchProfile();
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'profile':
        return <ProfileForm user={user} />;
      case 'password':
        return <ChangePassword user={user} />;
      case 'events':
        return <AdminManageEvents />;
      case 'users':
        return <AdminManageUsers />;
      default:
        return <ProfileForm user={user} />;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#d6ccff] via-[#ebe5ff] via-30% to-white text-gray-600">
        <div className="text-xl font-medium animate-pulse">
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-gray-800 bg-[linear-gradient(to_bottom,_#d6ccff_0%,_#ebe5ff_20%,_#ffffff_30%,_#ffffff_100%)]">
      <div className="flex flex-1">
        <div className="pt-16">
          <AdminSidebar activePage={activePage} setActivePage={setActivePage} />
        </div>
        <main className="flex-1 px-6 py-6">{renderPage()}</main>
      </div>
      <Footer />
    </div>
  );
}
