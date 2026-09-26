import BTCChart from "../components/BTCChart";

function Dashboard() {
  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Bitcoin Intelligence</h1>

          <p className="text-gray-400 text-sm mt-1">
            Real-time Bitcoin market overview
          </p>
        </div>

        <div className="flex items-center gap-2 text-green-400 text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          LIVE
        </div>
      </div>

      {/* Market + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 shrink-0">
        {/* Market Information */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            MARKET OVERVIEW
          </h2>

          <div className="mb-4">
            <p className="text-gray-400 text-sm">BTC / USDT</p>

            <div className="flex items-end gap-3 mt-1">
              <h2 className="text-3xl font-bold">$67,420</h2>

              <span className="text-green-400 text-sm mb-1">+2.34%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <div className="py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">24h High</p>
              <p className="font-medium mt-1">$68,100</p>
            </div>

            <div className="py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">24h Low</p>
              <p className="font-medium mt-1">$65,900</p>
            </div>

            <div className="py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">24h Volume</p>
              <p className="font-medium mt-1">$42.8B</p>
            </div>

            <div className="py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">Market Status</p>
              <p className="text-green-400 font-medium mt-1">Active</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-medium">BTC / USDT</h2>

              <p className="text-gray-500 text-xs mt-1">Live price movement</p>
            </div>

            <span className="text-xs text-gray-400">1H</span>
          </div>

          <div className="h-56">
            <BTCChart />
          </div>
        </div>
      </div>

      {/* AI Intelligence */}
      <div className="flex-1 min-h-0">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-gray-400">AI INTELLIGENCE</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Prediction */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs">📈 Prediction</p>

            <p className="text-lg font-semibold text-green-400 mt-2">
              ↑ Bullish
            </p>

            <p className="text-gray-500 text-xs mt-1">+0.18% expected</p>
          </div>

          {/* Whale */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs">🐋 Whale Activity</p>

            <p className="text-lg font-semibold mt-2">Normal</p>

            <p className="text-gray-500 text-xs mt-1">No major movement</p>
          </div>

          {/* Anomaly */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs">⚠️ Anomalies</p>

            <p className="text-lg font-semibold text-green-400 mt-2">Normal</p>

            <p className="text-gray-500 text-xs mt-1">No major anomaly</p>
          </div>

          {/* Sentiment */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs">🧠 Sentiment</p>

            <p className="text-lg font-semibold text-green-400 mt-2">Bullish</p>

            <p className="text-gray-500 text-xs mt-1">Score: 72 / 100</p>
          </div>

          {/* Risk */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs">🛡️ Risk</p>

            <p className="text-lg font-semibold text-yellow-400 mt-2">Medium</p>

            <p className="text-gray-500 text-xs mt-1">Score: 48 / 100</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
