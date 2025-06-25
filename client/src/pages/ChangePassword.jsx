import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/user/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        toast.error(result.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg text-gray-800"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Change Password</h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">Confirm New Password</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:from-purple-600 hover:to-violet-700 transition duration-300"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}
