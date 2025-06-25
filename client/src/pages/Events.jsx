import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        if (selectedCategory === 'For You') {
          const res = await axios.get('http://localhost:3000/api/events/recommendations', {
            withCredentials: true,
          });

          const { recommended, others } = res.data;

          setEvents([...recommended, ...others]);
        } else {
          const res = await axios.get('http://localhost:3000/api/events', {
            withCredentials: true,
          });

          setEvents(res.data);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Something went wrong while fetching events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'For You' ||
        event.category?.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [events, search, selectedCategory]);
      
  return (
    <div className="min-h-screen">
      <header className="w-full fixed top-0 left-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-2xl font-bebas font-bold tracking-wide text-gray-800">
            🎟️ OMNITIX
          </div>

          <div className="flex-1 text-center">
            <nav className="inline-flex space-x-2 sm:space-x-4 text-sm font-medium">
              {['For You', 'Movie', 'Concert', 'Train'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:text-purple-600 bg-transparent'
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="pl-4 pr-4 py-1.5 w-64 border border-gray-300 rounded-full shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <img
              src={user?.profilePic ? `http://localhost:3000${user.profilePic}` : '/default-profile.jpg'}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border"
            />
          </div>
        </div>
      </header>

      <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-500">Loading events...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="flex flex-wrap justify-start gap-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/book/${event.id}`)}
                className="cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition w-[192px] h-[343.6px] bg-white"
              >
                <img
                  src={event.banner || '/default-banner.jpg'}
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-3 flex flex-col h-[calc(343.6px-256px)] justify-start">
                  <h2 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                    {event.title}
                  </h2>
                  <p className="text-xs text-gray-700 line-clamp-3 overflow-hidden">
                    {event.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="w-full text-gray-500 text-center">No events found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
