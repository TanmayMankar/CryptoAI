import { NavLink } from "react-router-dom";

function Sidebar() {
  const links = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Price Prediction", path: "/prediction", icon: "📈" },
    { name: "Whale Activity", path: "/whales", icon: "🐋" },
    { name: "Anomalies", path: "/anomalies", icon: "⚠️" },
    { name: "Risk Analysis", path: "/risk", icon: "🛡️" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 text-white">
      <div className="h-20 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">₿ CryptoAI</h1>
      </div>

      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
