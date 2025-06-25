import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("resetEmail");

    try {
      const res = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await res.json();
      setMessage(data.message || "Password reset");

      if (res.ok) {
        localStorage.removeItem("resetEmail");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch {
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-10">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-1 text-gray-800">
            Reset Your Password
          </h1>
          <p className="text-sm text-center mb-6 text-gray-500">
            Enter the 6-digit code sent to your email and set a new password.
          </p>

          {message && (
            <p className="text-center text-sm mb-4 text-blue-600">{message}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="6-digit code"
              className="w-full px-4 py-3 rounded-full bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full px-4 py-3 rounded-full bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold py-3 rounded-full hover:opacity-90 transition"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-teal-400 to-blue-500 text-white p-12">
        <div className="text-center max-w-sm">
          <h2 className="text-3xl font-bold mb-4">Back to Safety</h2>
          <p className="text-md">
            You’re just a step away from securing your account again.
          </p>
        </div>
      </div>
    </div>
  );
}
