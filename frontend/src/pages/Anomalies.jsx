import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const formatScore = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "--";
  }

  return Number(value).toExponential(4);
};

function Anomalies() {
  const [anomaly, setAnomaly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anomalyHistory, setAnomalyHistory] = useState([]);

  const fetchAnomaly = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/api/anomaly");
      const result = response.data?.anomaly;

      if (!result) {
        throw new Error("The anomaly API returned no result.");
      }

      setAnomaly(result);
      return result;
    } catch (err) {
      console.error("Anomaly fetch error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load anomaly analysis.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnomalyHistory = useCallback(async () => {
    try {
      const response = await api.get("/api/anomaly/history");
      setAnomalyHistory(response.data?.history ?? []);
    } catch (err) {
      console.error("Failed to fetch anomaly history:", err);
    }
  }, []);

  useEffect(() => {
    fetchAnomaly();
    fetchAnomalyHistory();

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Anomaly WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const candle = JSON.parse(event.data);

        if (candle.isClosed === true) {
          console.log("Candle closed. Refreshing anomaly analysis.");

          setLoading(true);

          fetchAnomaly().then((result) => {
            if (result) {
              fetchAnomalyHistory();
            }
          });
        }
      } catch (err) {
        console.error("Invalid WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("Anomaly WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("Anomaly WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, [fetchAnomaly, fetchAnomalyHistory]);

  // Support both the new Isolation Forest response and existing history fields.
  const score = Number(anomaly?.score ?? anomaly?.anomaly_score);
  const threshold = Number(anomaly?.threshold);
  const isAnomaly = Boolean(anomaly?.anomaly ?? anomaly?.is_anomaly);

  const severity = anomaly?.severity ?? (isAnomaly ? "HIGH" : "NORMAL");

  const scoreIsValid = Number.isFinite(score);
  const thresholdIsValid = Number.isFinite(threshold);

  const severityColor =
    severity === "NORMAL"
      ? "text-green-400"
      : severity === "MODERATE"
        ? "text-yellow-400"
        : "text-red-400";

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

  const formatTime = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? "--" : date.toLocaleString();
  };

  return (
    <div className="min-h-full text-gray-200">
      {/* Header */}
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
            {loading ? "ANALYZING" : error ? "ERROR" : "SYSTEM ACTIVE"}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Main status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Anomaly score */}
        <div className="bg-[#080808] border border-gray-900 rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] tracking-[0.2em] text-gray-600">
              ANOMALY SCORE
            </span>

            <span className="text-[9px] text-gray-700">MODEL OUTPUT</span>
          </div>

          <div className="text-2xl font-bold text-white mb-3 break-all">
            {loading ? "--" : formatScore(score)}
          </div>

          <div className="text-xs text-gray-500 mb-4">
            Decision threshold:{" "}
            <span className="text-gray-300">
              {loading ? "--" : formatScore(threshold)}
            </span>
          </div>

          <div className="text-[10px] text-gray-600 leading-relaxed">
            Lower decision scores indicate more anomalous observations. An alert
            is raised when the score falls below the threshold.
          </div>
        </div>

        {/* Current status */}
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
                : "No unusual behavior flagged by the model."}
          </p>
        </div>

        {/* Severity */}
        <div className="bg-[#080808] border border-gray-900 rounded-md p-5">
          <div className="text-[9px] tracking-[0.2em] text-gray-600 mb-4">
            SEVERITY LEVEL
          </div>

          <div className={`text-3xl font-bold ${severityColor}`}>
            {loading ? "..." : severity}
          </div>

          <p className="text-xs text-gray-600 mt-3">
            Severity classification returned by the ML service.
          </p>
        </div>
      </div>

      {/* Analysis parameters and model status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              <p className="text-[8px] text-gray-700 tracking-widest">MODEL</p>
              <p className="text-sm font-bold text-gray-300 mt-1">
                Isolation Forest
              </p>
            </div>

            <div className="bg-[#0b0b0b] border border-gray-900 rounded p-3">
              <p className="text-[8px] text-gray-700 tracking-widest">
                FEATURES
              </p>
              <p className="text-sm font-bold text-gray-300 mt-1">
                {anomaly?.features_used ?? 12}
              </p>
            </div>

            <div className="bg-[#0b0b0b] border border-gray-900 rounded p-3">
              <p className="text-[8px] text-gray-700 tracking-widest">
                THRESHOLD
              </p>
              <p className="text-sm font-bold text-gray-300 mt-1 break-all">
                {loading ? "--" : formatScore(threshold)}
              </p>
            </div>
          </div>
        </div>

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

              <span
                className={`text-xs font-bold ${
                  error ? "text-red-400" : "text-green-400"
                }`}
              >
                {error ? "● ERROR" : "● CONNECTED"}
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded px-4 py-3">
              <span className="text-xs text-gray-500">MODEL</span>
              <span className="text-xs font-bold text-gray-300">
                ISOLATION FOREST
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded px-4 py-3">
              <span className="text-xs text-gray-500">FEATURE COUNT</span>
              <span className="text-xs font-bold text-gray-300">
                {anomaly?.features_used ?? 12}
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#0b0b0b] border border-gray-900 rounded px-4 py-3">
              <span className="text-xs text-gray-500">DETECTION</span>

              <span
                className={`text-xs font-bold ${
                  loading
                    ? "text-yellow-400"
                    : isAnomaly
                      ? "text-red-400"
                      : "text-green-400"
                }`}
              >
                {loading ? "ANALYZING" : isAnomaly ? "DETECTED" : "CLEAR"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent anomaly history */}
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
              const itemIsAnomaly = Boolean(item.is_anomaly);
              const itemSeverity = item.severity ?? "NORMAL";

              const itemSeverityColor =
                itemSeverity === "NORMAL"
                  ? "text-green-400"
                  : itemSeverity === "MODERATE"
                    ? "text-yellow-400"
                    : "text-red-400";

              const itemSeverityBg =
                itemSeverity === "NORMAL"
                  ? "bg-green-500/5 border-green-500/20"
                  : itemSeverity === "MODERATE"
                    ? "bg-yellow-500/5 border-yellow-500/20"
                    : "bg-red-500/5 border-red-500/20";

              return (
                <div
                  key={item._id ?? `${item.candle_open_time}-${index}`}
                  className="grid grid-cols-12 items-center px-4 py-3 mb-2 last:mb-0 bg-[#0b0b0b] border border-gray-900 rounded-md"
                >
                  <div className="col-span-1">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#111111] border border-gray-800 text-[10px] font-bold text-gray-500">
                      {index + 1}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        itemIsAnomaly ? "bg-red-500" : "bg-green-400"
                      }`}
                    />

                    <span
                      className={`text-xs font-bold tracking-wider ${
                        itemIsAnomaly ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {itemIsAnomaly ? "ANOMALY" : "NORMAL"}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded border text-[10px] font-bold tracking-wider ${itemSeverityColor} ${itemSeverityBg}`}
                    >
                      {itemSeverity}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <span className="text-xs font-bold text-gray-200 break-all">
                      {formatScore(item.anomaly_score)}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-[10px] text-gray-500">
                      {formatTime(item.candle_close_time)}
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
