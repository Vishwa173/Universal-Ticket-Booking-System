import React, { useState } from "react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful! Please log in.");
        setName("");
        setEmail("");
        setPassword("");
        setRole("user");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-1 text-gray-800">
            OMNITIX
          </h1>
          <p className="text-sm text-center mb-6 text-gray-500">Create a new account</p>

          {error && (
            <div className="bg-red-100 text-red-600 text-sm px-4 py-2 mb-4 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-600 text-sm px-4 py-2 mb-4 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-full bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-full bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-full bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold py-3 rounded-full hover:opacity-90 transition"
            >
              Register
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm select-none">
            Already have an account?{" "}
            <a href="/" className="text-blue-500 hover:underline font-medium">
              Login here
            </a>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-teal-400 to-blue-500 text-white p-12">
        <div className="text-center max-w-sm">
          <h2 className="text-3xl font-bold mb-4">Welcome Aboard!</h2>
          <p className="text-md">
            Register now to unlock unforgettable movie nights, concerts & train journeys.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
