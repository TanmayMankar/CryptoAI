import { useEffect, useState } from "react";
import api from "../services/api";

function Prediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marketData, setMarketData] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);

  useEffect(() => {

    const fetchPredictionHistory = async () => {
      try {
        const response = await api.get("/api/prediction/history");
        setPredictionHistory(response.data.history);
      } catch (error) {
        console.error("Failed to fetch prediction history:", error);
      }
    };

    fetchPredictionHistory();
    const fetchPrediction = async () => {
      try {
        setError("");

        const response = await api.get("/api/prediction");

        setPrediction(response.data.prediction);
        return response.data.prediction;
      } catch (err) {
        console.error("Prediction fetch error:", err);

        setError(err.response?.data?.message || "Unable to load prediction.");
      } finally {
        setLoading(false);
      }
    };

    // Get current prediction immediately
    fetchPrediction();

    // Listen for live Binance candle updates
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Prediction WebSocket connected");
    };

    socket.onmessage = (event) => {
      const candle = JSON.parse(event.data);

      console.log("Prediction candle:", candle);

      // Update ALL live market information
      setMarketData(candle);

      // Prediction updates ONLY after candle closes
      if (candle.isClosed === true) {
        console.log("Candle closed. Fetching new prediction...");

        setLoading(true);

        fetchPrediction().then(() => {
          fetchPredictionHistory();
        });
      }
    };

    socket.onerror = (error) => {
      console.error("Prediction WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Prediction WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  const upProbability = prediction ? prediction.up_probability * 100 : 0;

  const downProbability = prediction ? prediction.down_probability * 100 : 0;

  const isUp = prediction?.prediction === "UP";

  const candleDirection =
    marketData?.close > marketData?.open
      ? "BULLISH"
      : marketData?.close < marketData?.open
        ? "BEARISH"
        : "NEUTRAL";

  const candleDirectionColor =
    candleDirection === "BULLISH"
      ? "text-green-400"
      : candleDirection === "BEARISH"
        ? "text-red-400"
        : "text-gray-500";

  return (
    <div className="min-h-full text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-orange-400 text-2xl">₿</span>

            <h1 className="text-2xl font-black tracking-wider">
              PREDICTION TERMINAL
            </h1>
          </div>

          <p className="text-[10px] text-gray-600 tracking-[0.25em] uppercase mt-1">
            BTCUSDT • GRU Market Direction Intelligence
          </p>
        </div>

        <div className="flex items-center gap-2 border border-green-500/20 bg-green-500/5 px-3 py-2 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.9)]" />

          <span className="text-[9px] text-green-400 tracking-[0.2em]">
            MODEL ONLINE
          </span>
        </div>
      </div>

      {/* Current market data + prediction */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        {/* Live Market Data */}
        <div className="bg-[#080808] border border-gray-900 rounded-md p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] text-gray-600 tracking-[0.25em] uppercase">
              Live Market Data
            </p>

            <span className="text-[8px] text-orange-400 tracking-widest">
              BTCUSDT
            </span>
          </div>

          {/* Current price */}
          <div className="text-3xl font-black text-gray-200">
            {marketData?.close !== undefined
              ? `$${marketData.close.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "--"}
          </div>

          {/* Live status */}
          <div className="flex items-center gap-2 mt-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_7px_rgba(74,222,128,0.8)]" />

            <span className="text-[8px] text-gray-600 tracking-widest">
              LIVE MARKET DATA
            </span>
          </div>

          {/* OHLC + Trades */}
          <div className="grid grid-cols-4 gap-2 border-t border-gray-900 pt-3">
            <div>
              <p className="text-[7px] text-gray-700 tracking-wider">OPEN</p>

              <p className="text-[10px] text-gray-400 mt-1">
                {marketData?.open !== undefined
                  ? marketData.open.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "--"}
              </p>
            </div>

            <div>
              <p className="text-[7px] text-gray-700 tracking-wider">HIGH</p>

              <p className="text-[10px] text-green-400 mt-1">
                {marketData?.high !== undefined
                  ? marketData.high.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "--"}
              </p>
            </div>

            <div>
              <p className="text-[7px] text-gray-700 tracking-wider">LOW</p>

              <p className="text-[10px] text-red-400 mt-1">
                {marketData?.low !== undefined
                  ? marketData.low.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "--"}
              </p>
            </div>

            <div>
              <p className="text-[7px] text-gray-700 tracking-wider">TRADES</p>

              <p className="text-[10px] text-gray-400 mt-1">
                {marketData?.trades !== undefined
                  ? marketData.trades.toLocaleString()
                  : "--"}
              </p>
            </div>
          </div>

          {/* Volume information */}
          <div className="grid grid-cols-2 gap-2 border-t border-gray-900 mt-3 pt-3">
            <div>
              <p className="text-[7px] text-gray-700 tracking-wider">VOLUME</p>

              <p className="text-[10px] text-gray-400 mt-1">
                {marketData?.volume !== undefined
                  ? `${marketData.volume.toFixed(5)} BTC`
                  : "--"}
              </p>
            </div>

            <div>
              <p className="text-[7px] text-gray-700 tracking-wider">
                TAKER BUY
              </p>

              <p className="text-[10px] text-gray-400 mt-1">
                {marketData?.takerBuyBaseVolume !== undefined
                  ? `${marketData.takerBuyBaseVolume.toFixed(5)} BTC`
                  : "--"}
              </p>
            </div>
          </div>

          {/* Candle status + direction */}
          <div className="flex items-center justify-between border-t border-gray-900 mt-3 pt-3">
            <div>
              <p className="text-[7px] text-gray-700 tracking-wider">CANDLE</p>

              <p
                className={`text-[9px] font-bold mt-1 ${
                  marketData?.isClosed ? "text-green-400" : "text-orange-400"
                }`}
              >
                {marketData
                  ? marketData.isClosed
                    ? "CLOSED"
                    : "FORMING"
                  : "--"}
              </p>
            </div>

            <div>
              <p className="text-[7px] text-gray-700 tracking-wider text-right">
                DIRECTION
              </p>

              <p
                className={`text-[9px] font-bold mt-1 text-right ${candleDirectionColor}`}
              >
                {marketData
                  ? candleDirection === "BULLISH"
                    ? "▲ BULLISH"
                    : candleDirection === "BEARISH"
                      ? "▼ BEARISH"
                      : "— NEUTRAL"
                  : "--"}
              </p>
            </div>
          </div>
        </div>

        {/* Main prediction */}
        <div
          className={`xl:col-span-2 bg-[#080808] rounded-md p-5 relative overflow-hidden ${
            isUp ? "border border-green-500/20" : "border border-red-500/20"
          }`}
        >
          {/* Background glow */}
          <div
            className={`absolute right-[-80px] top-[-100px] w-64 h-64 rounded-full blur-3xl pointer-events-none ${
              isUp ? "bg-green-500/5" : "bg-red-500/5"
            }`}
          />

          {/* Header */}
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-[9px] text-gray-600 tracking-[0.25em] uppercase">
                Latest Model Prediction
              </p>

              <p className="text-[8px] text-gray-700 tracking-widest mt-1">
                NEXT 15 MINUTES
              </p>
            </div>

            <span className="text-[9px] text-orange-400 border border-orange-500/20 bg-orange-500/5 px-2 py-1 rounded">
              GRU
            </span>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 relative">
            {/* LEFT — Prediction */}
            <div className="flex flex-col items-center justify-center border-r border-gray-900 pr-8">
              {loading ? (
                <div className="text-center">
                  <div className="text-3xl text-orange-400 animate-pulse">
                    ₿
                  </div>

                  <div className="text-[9px] text-gray-600 tracking-[0.2em] mt-3">
                    ANALYZING MARKET...
                  </div>
                </div>
              ) : error ? (
                <div className="text-center">
                  <div className="text-red-400 text-2xl mb-2">⚠</div>

                  <div className="text-sm text-red-400">{error}</div>
                </div>
              ) : (
                <>
                  <div
                    className={`text-6xl font-black ${
                      isUp
                        ? "text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.35)]"
                        : "text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.35)]"
                    }`}
                  >
                    {isUp ? "▲" : "▼"}
                  </div>

                  <div
                    className={`text-4xl font-black tracking-wider mt-2 ${
                      isUp ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {prediction.prediction}
                  </div>

                  <div className="text-[9px] text-gray-600 tracking-[0.2em] mt-3">
                    MODEL DIRECTION
                  </div>

                  {/* Main confidence */}
                  <div
                    className={`text-3xl font-black mt-5 ${
                      isUp ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {isUp
                      ? `${upProbability.toFixed(2)}%`
                      : `${downProbability.toFixed(2)}%`}
                  </div>

                  <div className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
                    SIGNAL PROBABILITY
                  </div>
                </>
              )}
            </div>

            {/* RIGHT — Probabilities + model info */}
            <div className="flex flex-col justify-center">
              {/* UP probability */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] text-gray-600 tracking-[0.2em]">
                    UP PROBABILITY
                  </span>

                  <span className="text-[10px] font-bold text-green-400">
                    {loading ? "--.--%" : `${upProbability.toFixed(2)}%`}
                  </span>
                </div>

                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-700 shadow-[0_0_8px_rgba(74,222,128,0.35)]"
                    style={{ width: `${upProbability}%` }}
                  />
                </div>
              </div>

              {/* DOWN probability */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] text-gray-600 tracking-[0.2em]">
                    DOWN PROBABILITY
                  </span>

                  <span className="text-[10px] font-bold text-red-400">
                    {loading ? "--.--%" : `${downProbability.toFixed(2)}%`}
                  </span>
                </div>

                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-700 shadow-[0_0_8px_rgba(248,113,113,0.35)]"
                    style={{ width: `${downProbability}%` }}
                  />
                </div>
              </div>

              {/* Model information */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-gray-900 pt-5">
                <div>
                  <p className="text-[7px] text-gray-700 tracking-[0.2em]">
                    MODEL
                  </p>

                  <p className="text-[11px] text-orange-400 font-bold mt-1">
                    GRU
                  </p>
                </div>

                <div>
                  <p className="text-[7px] text-gray-700 tracking-[0.2em]">
                    HORIZON
                  </p>

                  <p className="text-[11px] text-gray-300 font-bold mt-1">
                    15 MIN
                  </p>
                </div>

                <div>
                  <p className="text-[7px] text-gray-700 tracking-[0.2em]">
                    SEQUENCE
                  </p>

                  <p className="text-[11px] text-gray-300 font-bold mt-1">
                    60 CANDLES
                  </p>
                </div>

                <div>
                  <p className="text-[7px] text-gray-700 tracking-[0.2em]">
                    FEATURES
                  </p>

                  <p className="text-[11px] text-gray-300 font-bold mt-1">14</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Previous predictions */}
      <div className="bg-[#080808] border border-gray-900 rounded-md mb-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div>
            <h2 className="text-base font-bold tracking-wider text-gray-100">
              PREVIOUS 5 PREDICTIONS
            </h2>

            <p className="text-[9px] text-gray-600 tracking-[0.2em] mt-1">
              RECENT MODEL SIGNALS
            </p>
          </div>

          <span className="px-3 py-1.5 border border-gray-800 rounded text-[9px] text-gray-500 tracking-widest">
            HISTORY
          </span>
        </div>

        {/* Column headings */}
        <div className="grid grid-cols-12 items-center px-5 py-3 border-b border-gray-900 text-[9px] font-bold tracking-widest text-gray-600">
          <span className="col-span-1">#</span>
          <span className="col-span-3">PREDICTION</span>
          <span className="col-span-5">CONFIDENCE</span>
          <span className="col-span-3 text-right">TIME</span>
        </div>

        {/* Predictions */}
        <div className="p-3">
          {predictionHistory.length > 0 ? (
            predictionHistory.map((item, index) => {
              const confidence =
                Math.max(item.up_probability, item.down_probability) * 100;

              const isUp = item.prediction === "UP";

              return (
                <div
                  key={item._id}
                  className="grid grid-cols-12 items-center px-4 py-3 mb-2 last:mb-0 bg-[#0b0b0b] border border-gray-900 rounded-md hover:border-gray-800 transition"
                >
                  {/* Number */}
                  <div className="col-span-1">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#111111] border border-gray-800 text-[10px] font-bold text-gray-500">
                      {index + 1}
                    </span>
                  </div>

                  {/* Prediction */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isUp
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      <span
                        className={`text-lg font-bold ${
                          isUp ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isUp ? "↑" : "↓"}
                      </span>
                    </div>

                    <span
                      className={`text-sm font-bold tracking-wider ${
                        isUp ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {item.prediction}
                    </span>
                  </div>

                  {/* Confidence */}
                  <div className="col-span-5 flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-200 w-14">
                      {confidence.toFixed(1)}%
                    </span>

                    <div className="flex-1 max-w-[260px] h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                      <div
                        className={`h-full rounded-full ${
                          isUp ? "bg-green-400" : "bg-red-400"
                        }`}
                        style={{
                          width: `${confidence}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="col-span-3 text-right">
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(item.candle_close_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-gray-600">
              NO PREDICTION HISTORY
            </div>
          )}
        </div>
      </div>

      {/* Model information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#080808] border border-gray-900 rounded-md p-4">
          <p className="text-[8px] text-gray-700 tracking-[0.2em]">MODEL</p>

          <p className="text-sm font-bold text-orange-400 mt-2">GRU</p>
        </div>

        <div className="bg-[#080808] border border-gray-900 rounded-md p-4">
          <p className="text-[8px] text-gray-700 tracking-[0.2em]">SEQUENCE</p>

          <p className="text-sm font-bold text-gray-300 mt-2">60 CANDLES</p>
        </div>

        <div className="bg-[#080808] border border-gray-900 rounded-md p-4">
          <p className="text-[8px] text-gray-700 tracking-[0.2em]">HORIZON</p>

          <p className="text-sm font-bold text-gray-300 mt-2">15 MIN</p>
        </div>

        <div className="bg-[#080808] border border-gray-900 rounded-md p-4">
          <p className="text-[8px] text-gray-700 tracking-[0.2em]">FEATURES</p>

          <p className="text-sm font-bold text-gray-300 mt-2">14</p>
        </div>
      </div>
    </div>
  );
}

export default Prediction;
