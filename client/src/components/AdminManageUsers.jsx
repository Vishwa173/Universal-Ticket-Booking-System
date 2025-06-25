import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminManageUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('user');
  const [users, setUsers] = useState([]);
  const [banForm, setBanForm] = useState({ reason: '', duration: '' });
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/admin/users?search=${search}&role=${roleFilter}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleBan = async (userId) => {
    if (!banForm.duration || !banForm.reason) {
      toast.error('Please provide reason and duration');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/ban`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banForm),
      });

      if (res.ok) {
        toast.success('User banned');
        setBanForm({ reason: '', duration: '' });
        setSelectedUserId(null);
        fetchUsers();
      } else {
        const result = await res.json();
        toast.error(result.message || 'Failed to ban user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  const handleUnban = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${userId}/unban`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        toast.success('User unbanned');
        fetchUsers();
      } else {
        const result = await res.json();
        toast.error(result.message || 'Failed to unban');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <h2 className="text-3xl font-bold text-gray-800">Manage Users & Vendors</h2>

      <div className="flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg max-w-md w-full bg-white"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="user">Users</option>
          <option value="vendor">Vendors</option>
        </select>
      </div>

      <div className="grid gap-4">
        {users.length === 0 && (
          <p className="text-gray-500 italic">No users found.</p>
        )}

        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white shadow p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              {user.isBanned && (
                <p className="text-red-600 text-sm">
                  Banned — {user.banReason} {user.banUntil && `(until ${user.banUntil?.substring(0, 10)})`}
                </p>
              )}
            </div>
            <div className="mt-2 sm:mt-0 flex gap-2 flex-wrap">
              {!user.isBanned ? (
                <button
                  onClick={() => setSelectedUserId(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Ban
                </button>
              ) : (
                <button
                  onClick={() => handleUnban(user.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Unban
                </button>
              )}
            </div>

            {selectedUserId === user.id && (
              <div className="mt-4 w-full bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                <h4 className="text-sm font-medium text-red-700">Ban this user</h4>
                <input
                  type="text"
                  placeholder="Reason"
                  value={banForm.reason}
                  onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                  className="w-full p-2 border border-red-300 rounded bg-white"
                />
                <select
                  value={banForm.duration}
                  onChange={(e) => setBanForm({ ...banForm, duration: e.target.value })}
                  className="w-full p-2 border border-red-300 rounded bg-white"
                >
                  <option value="">Select Duration</option>
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">1 week</option>
                  <option value="30">1 month</option>
                  <option value="permanent">Permanent</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBan(user.id)}
                    className="bg-red-600 text-white px-4 py-1 rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="text-black hover:underline bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
