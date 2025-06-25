import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
      } else {
        if (role === "user") navigate("/dashboard/user");
        else if (role === "vendor") navigate("/dashboard/vendor");
        else if (role === "admin") navigate("/dashboard/admin");
      }
    } catch {
      setError("Server error. Please try again.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();
      setForgotMessage(data.message || "If the email exists, a code will be sent.");

      if (response.ok) {
        localStorage.setItem("resetEmail", forgotEmail);
        navigate("/verify-code");
      }
    } catch {
      setForgotMessage("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-1 text-gray-800">
            Universal Ticket Booking System
          </h1>
          <p className="text-sm text-center mb-6 text-gray-500">Login to your account</p>

          {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
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
              Sign In
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => setShowForgot(!showForgot)}
              className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {showForgot && (
            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-full bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold py-3 rounded-full hover:opacity-90 transition"
              >
                Send Code
              </button>
              {forgotMessage && (
                <p className="text-green-600 text-sm text-center">{forgotMessage}</p>
              )}
            </form>
          )}

          <div className="my-6 border-t text-center border-gray-300">
            <span className="px-4 text-sm text-gray-400 bg-white relative -top-3">
              or sign in with
            </span>
          </div>

          <div className="flex gap-4">
            <a
              href="http://localhost:3000/api/auth/google"
              className="w-1/2 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3">
                <path
                  fill="#4285F4"
                  d="M533.5 278.4c0-17.4-1.4-34-4.1-50.2H272v95h147.5c-6.3 34.2-25 63.2-53.2 82.7v68h85.9c50.3-46.3 81.3-114.5 81.3-195.5z"
                />
                <path
                  fill="#34A853"
                  d="M272 544.3c72.6 0 133.6-24.2 178.1-65.6l-85.9-68c-23.8 16-54.3 25.3-92.2 25.3-70.8 0-130.8-47.8-152.3-112.2H31.1v70.4c44.9 89.2 136.5 150.1 240.9 150.1z"
                />
                <path
                  fill="#FBBC04"
                  d="M119.7 323.8c-10.3-30.5-10.3-63.3 0-93.8v-70.4H31.1c-30.1 60.2-30.1 133.8 0 194z"
                />
                <path
                  fill="#EA4335"
                  d="M272 107.3c39 0 74 13.4 101.7 39.7l76.1-76.1C405.6 24.6 344.6 0 272 0 167.6 0 76 60.9 31.1 150.1l88.6 70.4C141.2 155.1 201.2 107.3 272 107.3z"
                />
              </svg>
              <span className="text-sm">Google</span>
            </a>

            <a
              href="http://localhost:3000/api/auth/dauth"
              className="w-1/2 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-full py-2 hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#004488">
                <path d="M2 12l9 8V4zM22 4h-2v16h2z" />
              </svg>
              <span className="text-sm">Dauth</span>
            </a>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-teal-400 to-blue-500 text-white p-12">
        <div className="text-center max-w-sm">
          <h2 className="text-3xl font-bold mb-4">New Here?</h2>
          <p className="text-md">
            Sign up and book your tickets to amazing experiences!
          </p>
          <a
            href="/register"
            className="mt-6 inline-block bg-white text-blue-600 font-semibold py-2 px-6 rounded-full shadow hover:bg-gray-100 transition"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
