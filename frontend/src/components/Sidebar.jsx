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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#050505] border-r border-orange-500/20 text-white shadow-[4px_0_30px_rgba(247,147,26,0.04)]">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-orange-500/20">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-orange-400 drop-shadow-[0_0_8px_rgba(247,147,26,0.4)]">
            ₿ CryptoAI
          </h1>

          <p className="text-[9px] text-gray-600 tracking-[0.3em] uppercase mt-1">
            Bitcoin Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <p className="px-3 mb-3 text-[9px] font-bold text-gray-600 tracking-[0.3em] uppercase">
          Navigation
        </p>

        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(247,147,26,0.08)]"
                  : "text-gray-500 border border-transparent hover:bg-orange-500/5 hover:text-orange-300 hover:border-orange-500/15"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full transition-all ${
                    isActive
                      ? "bg-orange-400 shadow-[0_0_8px_rgba(247,147,26,0.9)]"
                      : "bg-transparent"
                  }`}
                />

                <span
                  className={`text-base transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {link.icon}
                </span>

                <span className="text-sm font-medium tracking-wide">
                  {link.name}
                </span>

                {isActive && (
                  <span className="ml-auto text-orange-500 text-xs">●</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Terminal status */}
      <div className="absolute bottom-5 left-4 right-4">
        <div className="border border-orange-500/10 bg-orange-500/5 rounded-md p-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_7px_rgba(74,222,128,0.9)]" />

            <span className="text-[9px] text-green-400 tracking-[0.2em]">
              SYSTEM ONLINE
            </span>
          </div>

          <p className="text-[8px] text-gray-700 mt-2 tracking-widest">
            BTC INTELLIGENCE TERMINAL
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
