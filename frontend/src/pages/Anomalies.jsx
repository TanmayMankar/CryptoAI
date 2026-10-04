import { useEffect, useState } from "react";
import api from "../services/api";

function Anomalies() {
  const [anomaly, setAnomaly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anomalyHistory, setAnomalyHistory] = useState([]);

  useEffect(() => {
    const fetchAnomaly = async () => {
      try {
        setError("");

        const response = await api.get("/api/anomaly");

        setAnomaly(response.data.anomaly);
        return response.data.anomaly;
      } catch (err) {
        console.error("Anomaly fetch error:", err);

        setError(
          err.response?.data?.message || "Unable to load anomaly analysis.",
        );
      } finally {
        setLoading(false);
      }
    };


    const fetchAnomalyHistory = async () => {
      try {
        const response = await api.get("/api/anomaly/history");

        setAnomalyHistory(response.data.history);
      } catch (error) {
        console.error("Failed to fetch anomaly history:", error);
      }
    };

    // Get current anomaly immediately
    fetchAnomaly();
    fetchAnomalyHistory();

    // Listen for live Binance candle updates
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Anomaly WebSocket connected");
    };

    socket.onmessage = (event) => {
      const candle = JSON.parse(event.data);

      console.log("Anomaly candle:", candle);

      // Run anomaly detection only after candle closes
      if (candle.isClosed === true) {
        console.log("Candle closed. Fetching new anomaly analysis...");

        setLoading(true);

        fetchAnomaly().then(() => {
          fetchAnomalyHistory();
        });
      }
    };

    socket.onerror = (error) => {
      console.error("Anomaly WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Anomaly WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  const score = anomaly?.anomaly_score ?? 0;
  const threshold = anomaly?.threshold ?? 0.7350797653;
  const severity = anomaly?.severity ?? "NORMAL";
  const isAnomaly = anomaly?.is_anomaly ?? false;

  const scorePercentage = Math.min((score / threshold) * 100, 100);

  const severityColor =
    severity === "NORMAL"
      ? "text-green-400"
      : severity === "MODERATE"
        ? "text-yellow-400"
        : severity === "HIGH"
          ? "text-red-400"
          : "text-red-500";

  const severityBorder =
    severity === "NORMAL"
      ? "border-green-500/30"
      : severity === "MODERATE"
        ? "border-yellow-500/30"
        : "border-red-500/30";

  const severityBg =
    severity === "NORMAL"
      ? "bg-green-500/5"
      : severity === "MODERATE"
        ? "bg-yellow-500/5"
        : "bg-red-500/5";

  return (
    <div className="min-h-full text-gray-200">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-wider">
            ANOMALY DETECTION
          </h1>

          <p className="text-[9px] text-gray-600 tracking-[0.25em] mt-1">
            BTCUSDT MARKET BEHAVIOR ANALYSIS
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

      {error && (
        <div className="mb-4 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* MAIN STATUS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* SCORE */}
        <div className="bg-[#080808] border border-gray-900 rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] tracking-[0.2em] text-gray-600">
              ANOMALY SCORE
            </span>

            <span className="text-[9px] text-gray-700">MODEL OUTPUT</span>
          </div>

          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold text-white">
              {loading ? "--" : score.toFixed(4)}
            </span>

            <span className="text-xs text-gray-600 mb-1">
              / {threshold.toFixed(4)}
            </span>
          </div>

          {/* SCORE BAR */}
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                severity === "NORMAL"
                  ? "bg-green-400"
                  : severity === "MODERATE"
                    ? "bg-yellow-400"
                    : "bg-red-500"
              }`}
              style={{
                width: `${scorePercentage}%`,
              }}
            />
          </div>

          <div className="flex justify-between mt-2 text-[8px] text-gray-700 tracking-wider">
            <span>0.0000</span>
            <span>THRESHOLD {threshold.toFixed(4)}</span>
          </div>
        </div>

        {/* CURRENT STATUS */}
        <div
          className={`bg-[#080808] border ${severityBorder} rounded-md p-5 ${severityBg}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] tracking-[0.2em] text-gray-600">
              CURRENT STATUS
            </span>

            <span
              className={`w-2 h-2 rounded-full ${
                isAnomaly ? "bg-red-500" : "bg-green-400"
              }`}
            />
          </div>

          <div className={`text-3xl font-bold tracking-wider ${severityColor}`}>
            {loading ? "..." : isAnomaly ? "ANOMALY" : "NORMAL"}
          </div>

          <p className="text-xs text-gray-600 mt-3">
            {loading
              ? "Analyzing recent market behavior..."
              : isAnomaly
                ? "Unusual market behavior detected."
                : "No unusual market activity detected."}
          </p>
        </div>

        {/* SEVERITY */}
        <div className="bg-[#080808] border border-gray-900 rounded-md p-5">
          <div className="text-[9px] tracking-[0.2em] text-gray-600 mb-4">
            SEVERITY LEVEL
          </div>

          <div className={`text-3xl font-bold ${severityColor}`}>
            {loading ? "..." : severity}
          </div>

          <div className="mt-5 grid grid-cols-4 gap-1">
            <div
              className={`h-1.5 rounded ${
                severity === "NORMAL" ? "bg-green-400" : "bg-gray-900"
              }`}
            />

            <div
              className={`h-1.5 rounded ${
                severity === "MODERATE" ? "bg-yellow-400" : "bg-gray-900"
              }`}
            />

            <div
              className={`h-1.5 rounded ${
                severity === "HIGH" ? "bg-red-400" : "bg-gray-900"
              }`}
            />

            <div
              className={`h-1.5 rounded ${
                severity === "EXTREME" ? "bg-red-600" : "bg-gray-900"
              }`}
            />
          </div>

          <div className="grid grid-cols-4 mt-2 text-[7px] text-gray-700 text-center">
            <span>NORMAL</span>
            <span>MODERATE</span>
            <span>HIGH</span>
            <span>EXTREME</span>
          </div>
        </div>
      </div>

      {/* ANALYSIS + MODEL STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* ANALYSIS PARAMETERS */}
        <div className="bg-[#080808] border border-gray-900 rounded-md">
          <div className="px-5 py-4 border-b border-gray-900">
            <h2 className="text-sm font-bold tracking-wider">
              ANALYSIS PARAMETERS
            </h2>

            <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
              CURRENT MODEL INPUT
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
                {threshold.toFixed(4)}
              </p>
            </div>

            <div className="bg-[#0b0b0b] border border-gray-900 rounded p-3">
              <p className="text-[8px] text-gray-700 tracking-widest">SCORE</p>
              <p className={`text-sm font-bold mt-1 ${severityColor}`}>
                {score.toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        {/* MODEL STATUS */}
        <div className="bg-[#080808] border border-gray-900 rounded-md">
          <div className="px-5 py-4 border-b border-gray-900">
            <h2 className="text-sm font-bold tracking-wider">MODEL STATUS</h2>

            <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
              ANOMALY ENGINE
            </p>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded px-4 py-3">
              <span className="text-xs text-gray-500">DETECTION ENGINE</span>

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
                  isAnomaly ? "text-red-400" : "text-green-400"
                }`}
              >
                {isAnomaly ? "DETECTED" : "CLEAR"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT EVENTS */}
      {/* RECENT EVENTS */}
      <div className="bg-[#080808] border border-gray-900 rounded-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-900">
          <div>
            <h2 className="text-sm font-bold tracking-wider">
              RECENT ANOMALY EVENTS
            </h2>

            <p className="text-[8px] text-gray-700 tracking-[0.2em] mt-1">
              MARKET ACTIVITY HISTORY
            </p>
          </div>

          <span className="px-3 py-1.5 border border-gray-800 rounded text-[9px] text-gray-500 tracking-widest">
            LAST 5
          </span>
        </div>

        {/* Column headings */}
        <div className="grid grid-cols-12 items-center px-5 py-3 border-b border-gray-900 text-[9px] font-bold tracking-widest text-gray-600">
          <span className="col-span-1">#</span>
          <span className="col-span-3">STATUS</span>
          <span className="col-span-3">SEVERITY</span>
          <span className="col-span-3">SCORE</span>
          <span className="col-span-2 text-right">TIME</span>
        </div>

        <div className="p-3">
          {anomalyHistory.length > 0 ? (
            anomalyHistory.map((item, index) => {
              const isNormal = item.severity === "NORMAL";

              const severityColor =
                item.severity === "NORMAL"
                  ? "text-green-400"
                  : item.severity === "MODERATE"
                    ? "text-yellow-400"
                    : item.severity === "HIGH"
                      ? "text-red-400"
                      : "text-red-500";

              const severityBg =
                item.severity === "NORMAL"
                  ? "bg-green-500/5 border-green-500/20"
                  : item.severity === "MODERATE"
                    ? "bg-yellow-500/5 border-yellow-500/20"
                    : "bg-red-500/5 border-red-500/20";

              return (
                <div
                  key={item._id}
                  className="grid grid-cols-12 items-center px-4 py-3 mb-2 last:mb-0 bg-[#0b0b0b] border border-gray-900 rounded-md"
                >
                  {/* Number */}
                  <div className="col-span-1">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#111111] border border-gray-800 text-[10px] font-bold text-gray-500">
                      {index + 1}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-3 flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.is_anomaly ? "bg-red-500" : "bg-green-400"
                      }`}
                    />

                    <span
                      className={`text-sm font-bold tracking-wider ${
                        item.is_anomaly ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {item.is_anomaly ? "ANOMALY" : "NORMAL"}
                    </span>
                  </div>

                  {/* Severity */}
                  <div className="col-span-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded border text-[10px] font-bold tracking-wider ${severityColor} ${severityBg}`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-3 flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-200">
                      {item.anomaly_score.toFixed(4)}
                    </span>

                    <div className="hidden lg:block w-20 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isNormal
                            ? "bg-green-400"
                            : item.severity === "MODERATE"
                              ? "bg-yellow-400"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (item.anomaly_score / item.threshold) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div className="col-span-2 text-right">
                    <span className="text-xs text-gray-500">
                      {new Date(item.candle_close_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-gray-600">
                NO ANOMALY HISTORY AVAILABLE
              </p>

              <p className="text-[9px] text-gray-800 mt-2">
                Waiting for completed candle analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Anomalies;
