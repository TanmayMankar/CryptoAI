import { useEffect, useState } from "react";
import BTCChart from "../components/BTCChart";

function Dashboard() {
  const [marketData, setMarketData] = useState({
    price: 0,
    high: 0,
    low: 0,
    volume: 0,
    connected: false,
  });

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Dashboard WebSocket connected");

      setMarketData((previous) => ({
        ...previous,
        connected: true,
      }));
    };

    socket.onmessage = (event) => {
      const candle = JSON.parse(event.data);

      console.log("Dashboard Live BTC Data:", candle);

      setMarketData({
        price: candle.close,
        high: candle.high,
        low: candle.low,
        volume: candle.volume,
        connected: true,
      });
    };

    socket.onerror = (error) => {
      console.error("Dashboard WebSocket error:", error);

      setMarketData((previous) => ({
        ...previous,
        connected: false,
      }));
    };

    socket.onclose = () => {
      console.log("Dashboard WebSocket disconnected");

      setMarketData((previous) => ({
        ...previous,
        connected: false,
      }));
    };

    return () => {
      socket.close();
    };
  }, []);

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

        <div
          className={`flex items-center gap-2 text-sm ${
            marketData.connected ? "text-green-400" : "text-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              marketData.connected ? "bg-green-400" : "bg-red-400"
            }`}
          ></span>

          {marketData.connected ? "LIVE" : "OFFLINE"}
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
              {/* Current BTC Price */}
              <h2 className="text-3xl font-bold">
                $
                {marketData.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            {/* 1m High */}
            <div className="py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">1m High</p>

              <p className="font-medium mt-1">
                $
                {marketData.high.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* 1m Low */}
            <div className="py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">1m Low</p>

              <p className="font-medium mt-1">
                $
                {marketData.low.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* 1m Volume */}
            <div className="py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">1m Volume</p>

              <p className="font-medium mt-1">
                {marketData.volume.toFixed(4)} BTC
              </p>
            </div>

            {/* Market Status */}
            <div className="py-3 border-t border-gray-800">
              <p className="text-gray-500 text-xs">Market Status</p>

              <p
                className={`font-medium mt-1 ${
                  marketData.connected ? "text-green-400" : "text-red-400"
                }`}
              >
                {marketData.connected ? "Live" : "Disconnected"}
              </p>
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

          {/* Whale Activity */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs">🐋 Whale Activity</p>

            <p className="text-lg font-semibold mt-2">Normal</p>

            <p className="text-gray-500 text-xs mt-1">No major movement</p>
          </div>

          {/* Anomalies */}
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
