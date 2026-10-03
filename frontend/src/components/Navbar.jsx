import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="w-full h-20 border-b border-orange-500/20 bg-[#050505] text-white shadow-[0_4px_25px_rgba(247,147,26,0.04)]">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <span className="text-3xl font-black text-orange-400 drop-shadow-[0_0_10px_rgba(247,147,26,0.5)] transition-all duration-200 group-hover:drop-shadow-[0_0_16px_rgba(247,147,26,0.8)]">
            ₿
          </span>

          <div>
            <div className="text-xl font-black tracking-wider text-gray-100">
              Crypto<span className="text-orange-400">AI</span>
            </div>

            <div className="text-[8px] text-gray-600 tracking-[0.3em] uppercase">
              Bitcoin Intelligence
            </div>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              {/* Login */}
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold tracking-wide text-gray-500 border border-transparent rounded-md transition-all duration-200 hover:text-orange-400 hover:border-orange-500/20 hover:bg-orange-500/5"
              >
                LOGIN
              </Link>

              {/* Register */}
              <Link
                to="/register"
                className="px-5 py-2 text-sm font-bold tracking-wide text-black bg-orange-400 border border-orange-400 rounded-md transition-all duration-200 hover:bg-orange-300 hover:shadow-[0_0_18px_rgba(247,147,26,0.35)]"
              >
                REGISTER
              </Link>
            </>
          ) : (
            <>
              {/* Online indicator */}
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />

                <span className="text-[9px] text-green-400 tracking-[0.2em]">
                  ONLINE
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-sm font-bold tracking-wide text-orange-400 border border-orange-500/30 rounded-md bg-orange-500/5 transition-all duration-200 hover:bg-orange-500 hover:text-black hover:border-orange-400 hover:shadow-[0_0_18px_rgba(247,147,26,0.35)]"
              >
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
