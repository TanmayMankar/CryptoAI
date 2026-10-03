import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Orange glow */}
        <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-orange-500/8 rounded-full blur-3xl" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(247,147,26,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(247,147,26,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <main className="relative flex flex-col items-center justify-center text-center px-6 py-28 min-h-[calc(100vh-5rem)]">
        {/* Terminal label */}
        <div className="mb-7 flex items-center gap-3">
          <span className="w-8 h-px bg-orange-500/50" />

          <span className="text-[10px] text-orange-400 tracking-[0.35em] uppercase">
            Bitcoin Intelligence System
          </span>

          <span className="w-8 h-px bg-orange-500/50" />
        </div>

        {/* Bitcoin symbol */}
        <div className="mb-6 text-6xl font-black text-orange-400 drop-shadow-[0_0_18px_rgba(247,147,26,0.5)]">
          ₿
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight max-w-5xl leading-[0.95]">
          SMARTER
          <span className="text-orange-400 drop-shadow-[0_0_15px_rgba(247,147,26,0.25)]">
            {" "}
            CRYPTO
          </span>
          <br />
          INTELLIGENCE
        </h1>

        {/* Description */}
        <p className="mt-7 text-sm md:text-lg text-gray-500 max-w-2xl leading-relaxed">
          Predict Bitcoin movements, detect whale activity, identify market
          anomalies, and assess crypto risk using data-driven intelligence.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button className="px-8 py-3 bg-orange-400 text-black font-black tracking-wide rounded-md border border-orange-400 transition-all duration-200 hover:bg-orange-300 hover:shadow-[0_0_25px_rgba(247,147,26,0.35)]">
            GET STARTED
          </button>

          <button className="px-8 py-3 bg-transparent text-gray-400 font-semibold tracking-wide border border-gray-800 rounded-md transition-all duration-200 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5">
            EXPLORE FEATURES
          </button>
        </div>

        {/* Intelligence modules */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl">
          <div className="border border-gray-900 bg-[#090909]/80 px-4 py-4 rounded-md">
            <div className="text-orange-400 text-xl mb-2">📈</div>
            <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase">
              Prediction
            </p>
          </div>

          <div className="border border-gray-900 bg-[#090909]/80 px-4 py-4 rounded-md">
            <div className="text-orange-400 text-xl mb-2">🐋</div>
            <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase">
              Whale Activity
            </p>
          </div>

          <div className="border border-gray-900 bg-[#090909]/80 px-4 py-4 rounded-md">
            <div className="text-orange-400 text-xl mb-2">⚠️</div>
            <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase">
              Anomaly Detection
            </p>
          </div>

          <div className="border border-gray-900 bg-[#090909]/80 px-4 py-4 rounded-md">
            <div className="text-orange-400 text-xl mb-2">🛡️</div>
            <p className="text-[9px] text-gray-600 tracking-[0.2em] uppercase">
              Risk Analysis
            </p>
          </div>
        </div>

        {/* System status */}
        <div className="mt-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />

          <span className="text-[8px] text-gray-700 tracking-[0.3em]">
            INTELLIGENCE SYSTEM ONLINE
          </span>
        </div>
      </main>
    </div>
  );
}

export default Home;
