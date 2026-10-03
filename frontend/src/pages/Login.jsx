import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { checkAuth } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", formData);

      await checkAuth();

      console.log("Login response:", response.data);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl" />

        <div className="absolute bottom-[-250px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/3 rounded-full blur-3xl" />
      </div>

      {/* Login panel */}
      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md bg-[#090909] border border-orange-500/20 p-8 rounded-md shadow-[0_0_40px_rgba(247,147,26,0.06)]"
      >
        {/* Top accent */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />

        {/* Logo / heading */}
        <div className="text-center mb-8">
          <div className="text-5xl font-black text-orange-400 drop-shadow-[0_0_12px_rgba(247,147,26,0.5)] mb-3">
            ₿
          </div>

          <h1 className="text-2xl font-black tracking-wider text-gray-100">
            CRYPTO<span className="text-orange-400">AI</span>
          </h1>

          <p className="text-[9px] text-gray-600 tracking-[0.35em] uppercase mt-2">
            Bitcoin Intelligence Terminal
          </p>
        </div>

        {/* Login label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold text-orange-400 tracking-[0.2em]">
            ACCESS TERMINAL
          </span>

          <div className="flex-1 h-px bg-orange-500/10" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Username */}
        <div className="mb-4">
          <label className="block text-[10px] text-gray-600 tracking-[0.2em] uppercase mb-2">
            Username
          </label>

          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#050505] border border-gray-800 rounded-md text-gray-200 placeholder-gray-700 outline-none transition-all duration-200 focus:border-orange-500/60 focus:shadow-[0_0_12px_rgba(247,147,26,0.08)]"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-[10px] text-gray-600 tracking-[0.2em] uppercase mb-2">
            Email
          </label>

          <input
            type="text"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#050505] border border-gray-800 rounded-md text-gray-200 placeholder-gray-700 outline-none transition-all duration-200 focus:border-orange-500/60 focus:shadow-[0_0_12px_rgba(247,147,26,0.08)]"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-[10px] text-gray-600 tracking-[0.2em] uppercase mb-2">
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#050505] border border-gray-800 rounded-md text-gray-200 placeholder-gray-700 outline-none transition-all duration-200 focus:border-orange-500/60 focus:shadow-[0_0_12px_rgba(247,147,26,0.08)]"
            required
          />
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-orange-400 text-black font-black tracking-wider rounded-md border border-orange-400 transition-all duration-200 hover:bg-orange-300 hover:shadow-[0_0_20px_rgba(247,147,26,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "AUTHENTICATING..." : "LOGIN"}
        </button>

        {/* Register */}
        <p className="mt-6 text-gray-600 text-xs text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            CREATE ACCOUNT
          </Link>
        </p>

        {/* Bottom status */}
        <div className="mt-6 pt-4 border-t border-gray-900 flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_7px_rgba(74,222,128,0.8)]" />
          <span className="text-[8px] text-gray-700 tracking-[0.25em]">
            SECURE CONNECTION
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login;
