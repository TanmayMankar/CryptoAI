import { useEffect, useState } from "react";
import api from "../services/api";

function RiskAnalysis() {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [riskHistory, setRiskHistory] = useState([]);

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        setError("");

        const response = await api.get("/api/risk");

        setRisk(response.data.risk);
        return response.data.risk;
      } catch (err) {
        console.error("Risk fetch error:", err);

        setError(
          err.response?.data?.message || "Unable to load risk analysis.",
        );
      } finally {
        setLoading(false);
      }
    };


    const fetchRiskHistory = async () => {
      try {
        const response = await api.get("/api/risk/history");

        setRiskHistory(response.data.history);
      } catch (error) {
        console.error("Failed to fetch risk history:", error);
      }
    };

    // Get current risk immediately
    fetchRisk();
    fetchRiskHistory();

    // Listen for live Binance candle updates
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Risk WebSocket connected");
    };

    socket.onmessage = (event) => {
      const candle = JSON.parse(event.data);

      console.log("Risk candle:", candle);

      // Run risk analysis only after candle closes
      if (candle.isClosed === true) {
        console.log("Candle closed. Fetching new risk analysis...");

        setLoading(true);

        fetchRisk().then(() => {
          fetchRiskHistory();
        });
      }
    };

    socket.onerror = (error) => {
      console.error("Risk WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Risk WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  const highRiskProbability = risk?.high_risk_probability ?? 0;

  const normalProbability = risk?.normal_probability ?? 0;

  const threshold = risk?.threshold ?? 0.7;

  const riskLevel = risk?.risk_level ?? "NORMAL";

  const isHighRisk = risk?.is_high_risk ?? false;

  const highRiskPercentage = highRiskProbability * 100;
  const normalPercentage = normalProbability * 100;
  const thresholdPercentage = threshold * 100;

  const riskLevelColor =
    riskLevel === "NORMAL"
      ? "text-green-400"
      : riskLevel === "MODERATE"
        ? "text-yellow-400"
        : riskLevel === "HIGH"
          ? "text-red-400"
          : "text-red-500";

  const riskLevelBorder =
    riskLevel === "NORMAL"
      ? "border-green-500/30"
      : riskLevel === "MODERATE"
        ? "border-yellow-500/30"
        : "border-red-500/30";

  const riskLevelBg =
    riskLevel === "NORMAL"
      ? "bg-green-500/5"
      : riskLevel === "MODERATE"
        ? "bg-yellow-500/5"
        : "bg-red-500/5";

  return (
    <div className="min-h-full text-gray-200">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-wider">RISK ANALYSIS</h1>

          <p className="text-[9px] text-gray-600 tracking-[0.25em] mt-1">
            BTCUSDT MARKET RISK ASSESSMENT
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 border border-gray-800 rounded-md bg-[#080808]">
          <span
            className={`w-2 h-2 rounded-full ${
              loading ? "bg-yellow-400" : error ? "bg-red-500" : "bg-green-400"
            }`}
          />

          <span className="text-[9px] tracking-widest text-gray-500">
            {loading ? "ANALYZING" : error ? "OFFLINE" : "SYSTEM ACTIVE"}
          </span>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* MAIN RISK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* RISK OVERVIEW */}
        <div className="bg-[#080808] border border-gray-900 rounded-md p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold tracking-wider">
                RISK OVERVIEW
              </h2>

              <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
                MODEL OUTPUT
              </p>
            </div>

            <span className="text-[9px] text-gray-600 tracking-widest">
              GRU
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* HIGH RISK */}
            <div>
              <p className="text-[9px] text-gray-600 tracking-widest">
                HIGH RISK PROBABILITY
              </p>

              <p className="text-3xl font-bold mt-2 text-white">
                {loading ? "--" : `${highRiskPercentage.toFixed(2)}%`}
              </p>

              <div className="mt-3 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighRisk ? "bg-red-500" : "bg-yellow-400"
                  }`}
                  style={{
                    width: `${Math.min(highRiskPercentage, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* THRESHOLD */}
            <div>
              <p className="text-[9px] text-gray-600 tracking-widest">
                RISK THRESHOLD
              </p>

              <p className="text-3xl font-bold mt-2 text-white">
                {loading ? "--" : `${thresholdPercentage.toFixed(0)}%`}
              </p>

              <div className="mt-3 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800 relative">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{
                    width: `${Math.min(highRiskPercentage, 100)}%`,
                  }}
                />

                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-400"
                  style={{
                    left: `${thresholdPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CURRENT RISK */}
        <div
          className={`bg-[#080808] border ${riskLevelBorder} rounded-md p-5 ${riskLevelBg}`}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold tracking-wider">CURRENT RISK</h2>

              <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
                MARKET CONDITION
              </p>
            </div>

            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isHighRisk ? "bg-red-500" : "bg-green-400"
              }`}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-3xl font-bold tracking-wider ${riskLevelColor}`}
              >
                {loading ? "ANALYZING" : riskLevel}
              </p>

              <p className="text-[10px] text-gray-600 mt-3">
                {loading
                  ? "Analyzing current market risk..."
                  : isHighRisk
                    ? "High-risk market conditions detected."
                    : "Market risk remains below the high-risk threshold."}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[9px] text-gray-700 tracking-widest">
                HIGH RISK
              </p>

              <p className={`text-xl font-bold ${riskLevelColor}`}>
                {loading ? "--" : `${highRiskPercentage.toFixed(2)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT RISK ASSESSMENTS */}
      <div className="bg-[#080808] border border-gray-900 rounded-md mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div>
            <h2 className="text-sm font-bold tracking-wider">
              RECENT RISK ASSESSMENTS
            </h2>

            <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
              LATEST 5 MODEL ASSESSMENTS
            </p>
          </div>

          <span className="text-[9px] text-gray-600 tracking-widest">
            LAST 5
          </span>
        </div>

        <div className="p-4">
          {riskHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-600">
              No risk history available.
            </div>
          ) : (
            <div className="space-y-2">
              {riskHistory.map((item, index) => {
                const time = new Date(item.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });

                const historyLevelColor =
                  item.risk_level === "NORMAL"
                    ? "text-green-400"
                    : item.risk_level === "MODERATE"
                      ? "text-yellow-400"
                      : item.risk_level === "HIGH"
                        ? "text-red-400"
                        : "text-red-500";

                return (
                  <div
                    key={item._id}
                    className="grid grid-cols-5 items-center border border-gray-900 bg-[#050505] px-4 py-3"
                  >
                    {/* NUMBER */}
                    <div className="text-[10px] text-gray-600">
                      #{index + 1}
                    </div>

                    {/* RISK LEVEL */}
                    <div
                      className={`text-[10px] font-bold tracking-wider ${historyLevelColor}`}
                    >
                      {item.risk_level}
                    </div>

                    {/* HIGH RISK */}
                    <div>
                      <p className="text-[8px] text-gray-700">HIGH RISK</p>

                      <p className="text-xs text-gray-300 font-bold">
                        {(item.high_risk_probability * 100).toFixed(2)}%
                      </p>
                    </div>

                    {/* NORMAL */}
                    <div>
                      <p className="text-[8px] text-gray-700">NORMAL</p>

                      <p className="text-xs text-gray-300 font-bold">
                        {(item.normal_probability * 100).toFixed(2)}%
                      </p>
                    </div>

                    {/* TIME */}
                    <div className="text-right">
                      <p className="text-[8px] text-gray-700">TIME</p>

                      <p className="text-[9px] text-gray-500">{time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PROBABILITY ANALYSIS */}
      <div className="bg-[#080808] border border-gray-900 rounded-md mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div>
            <h2 className="text-sm font-bold tracking-wider">
              RISK PROBABILITY
            </h2>

            <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
              MODEL CONFIDENCE DISTRIBUTION
            </p>
          </div>

          <span className="text-[9px] text-gray-700 tracking-widest">
            GRU OUTPUT
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* NORMAL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-green-400">
                NORMAL PROBABILITY
              </span>

              <span className="text-sm font-bold text-gray-200">
                {loading ? "--" : `${normalPercentage.toFixed(2)}%`}
              </span>
            </div>

            <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(normalPercentage, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* HIGH RISK */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-400">
                HIGH RISK PROBABILITY
              </span>

              <span className="text-sm font-bold text-gray-200">
                {loading ? "--" : `${highRiskPercentage.toFixed(2)}%`}
              </span>
            </div>

            <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isHighRisk ? "bg-red-500" : "bg-yellow-400"
                }`}
                style={{
                  width: `${Math.min(highRiskPercentage, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PARAMETERS + MODEL STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* RISK PARAMETERS */}
        <div className="bg-[#080808] border border-gray-900 rounded-md">
          <div className="px-5 py-4 border-b border-gray-900">
            <h2 className="text-sm font-bold tracking-wider">
              RISK PARAMETERS
            </h2>

            <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
              CURRENT MODEL OUTPUT
            </p>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3">
            <div className="bg-[#0b0b0b] border border-gray-900 rounded p-3">
              <p className="text-[8px] text-gray-700 tracking-widest">SYMBOL</p>
              <p className="text-sm font-bold text-gray-300 mt-1">BTCUSDT</p>
            </div>

            <div className="bg-[#0b0b0b] border border-gray-900 rounded p-3">
              <p className="text-[8px] text-gray-700 tracking-widest">WINDOW</p>
              <p className="text-sm font-bold text-gray-300 mt-1">60 CANDLES</p>
            </div>

            <div className="bg-[#0b0b0b] border border-gray-900 rounded p-3">
              <p className="text-[8px] text-gray-700 tracking-widest">
                THRESHOLD
              </p>
              <p className="text-sm font-bold text-gray-300 mt-1">
                {thresholdPercentage.toFixed(0)}%
              </p>
            </div>

            <div className="bg-[#0b0b0b] border border-gray-900 rounded p-3">
              <p className="text-[8px] text-gray-700 tracking-widest">
                HIGH RISK
              </p>
              <p className="text-sm font-bold text-red-400 mt-1">
                {highRiskPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* MODEL STATUS */}
        <div className="bg-[#080808] border border-gray-900 rounded-md">
          <div className="px-5 py-4 border-b border-gray-900">
            <h2 className="text-sm font-bold tracking-wider">MODEL STATUS</h2>

            <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
              RISK ENGINE
            </p>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded px-4 py-3">
              <span className="text-xs text-gray-500">RISK ENGINE</span>

              <span className="text-xs font-bold text-green-400">● ONLINE</span>
            </div>

            <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded px-4 py-3">
              <span className="text-xs text-gray-500">MODEL</span>

              <span className="text-xs font-bold text-gray-300">GRU</span>
            </div>

            <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded px-4 py-3">
              <span className="text-xs text-gray-500">INPUT WINDOW</span>

              <span className="text-xs font-bold text-gray-300">
                60 × 1 MIN
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded px-4 py-3">
              <span className="text-xs text-gray-500">DETECTION</span>

              <span
                className={`text-xs font-bold ${
                  isHighRisk ? "text-red-400" : "text-green-400"
                }`}
              >
                {isHighRisk ? "HIGH RISK" : "CLEAR"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskAnalysis;
