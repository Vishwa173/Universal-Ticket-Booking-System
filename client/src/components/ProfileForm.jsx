import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfileForm({ user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePic: '',
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        profilePic: user.profilePic || '',
      });
      setPreview(user.profilePic || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    if (file) form.append('profilePic', file);

    try {
      const res = await fetch('http://localhost:3000/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        body: form,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.message || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error(' Something went wrong.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white/60 backdrop-blur-lg p-8 rounded-3xl shadow-xl font-sans space-y-8 border border-gray-200"
    >
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <h2 className="text-3xl font-bold text-gray-800 mb-4 tracking-tight">
        Edit Profile
      </h2>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <img
            src={
              preview?.startsWith('blob:')
                ? preview
                : preview
                ? `${BASE_URL}${preview}`
                : '/default-avatar.png'
            }
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 shadow-md transition-transform duration-300 group-hover:scale-105"
          />
          <label className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-gray-800 font-medium mb-2">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-sm"
        />
      </div>

      <div>
        <label className="block text-gray-800 font-medium mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-sm"
        />
      </div>

      <button
        type="submit"
        className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-6 py-3 rounded-xl shadow-lg hover:from-purple-600 hover:to-violet-600 transform hover:scale-105 transition duration-300 ease-in-out"
      >
        Save Changes
      </button>
    </form>
  );
}
