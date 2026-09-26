import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function DashboardLayout({ children }) {
  const { setUser } = useAuth();
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
    <div className="min-h-screen bg-gray-950 text-white">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <header className="h-20 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold">Crypto Intelligence</h2>

          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        <section className="p-8">{children}</section>
      </main>
    </div>
  );
}

export default DashboardLayout;
