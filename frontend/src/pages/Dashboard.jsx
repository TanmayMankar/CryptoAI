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

  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(true);
  const [predictionUpdatedAt, setPredictionUpdatedAt] = useState(null);

  const [anomaly, setAnomaly] = useState(null);
  const [anomalyLoading, setAnomalyLoading] = useState(true);
  const [anomalyUpdatedAt, setAnomalyUpdatedAt] = useState(null);

  const [risk, setRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(true);
  const [riskUpdatedAt, setRiskUpdatedAt] = useState(null);

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

  useEffect(() => {
    const loadPrediction = async () => {
      try {
        setPredictionLoading(true);

        const response = await fetch("http://localhost:3000/api/prediction", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch prediction");
        }

        const result = await response.json();

        console.log("BTC Prediction:", result);

        setPrediction(result.prediction);
        setPredictionUpdatedAt(new Date());
      } catch (error) {
        console.error("Prediction error:", error);
      } finally {
        setPredictionLoading(false);
      }
    };

    loadPrediction();

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Prediction WebSocket connected");
    };

    socket.onmessage = (event) => {
      const candle = JSON.parse(event.data);

      if (candle.isClosed) {
        console.log("New completed candle. Refreshing prediction...");
        loadPrediction();
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

  useEffect(() => {
    const loadAnomaly = async () => {
      try {
        setAnomalyLoading(true);

        const response = await fetch("http://localhost:3000/api/anomaly", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch anomaly");
        }

        const result = await response.json();

        console.log("BTC Anomaly:", result);

        setAnomaly(result.anomaly);
        setAnomalyUpdatedAt(new Date());
      } catch (error) {
        console.error("Anomaly error:", error);
      } finally {
        setAnomalyLoading(false);
      }
    };

    loadAnomaly();

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Anomaly WebSocket connected");
    };

    socket.onmessage = (event) => {
      const candle = JSON.parse(event.data);

      if (candle.isClosed) {
        console.log("New completed candle. Refreshing anomaly...");
        loadAnomaly();
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

  useEffect(() => {
    const loadRisk = async () => {
      try {
        setRiskLoading(true);

        const response = await fetch("http://localhost:3000/api/risk", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch risk");
        }

        const result = await response.json();

        console.log("BTC Risk:", result);

        setRisk(result.risk);
        setRiskUpdatedAt(new Date());
      } catch (error) {
        console.error("Risk error:", error);
      } finally {
        setRiskLoading(false);
      }
    };

    loadRisk();

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Risk WebSocket connected");
    };

    socket.onmessage = (event) => {
      const candle = JSON.parse(event.data);

      if (candle.isClosed) {
        console.log("New completed candle. Refreshing risk...");
        loadRisk();
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

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-4 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 border-b border-orange-500/20 pb-3">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-orange-400 drop-shadow-[0_0_8px_rgba(247,147,26,0.35)]">
            Bitcoin Intelligence
          </h1>

          <p className="text-gray-500 text-xs mt-1 tracking-[0.2em] uppercase">
            Real-time Bitcoin market overview
          </p>
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-bold tracking-[0.2em] ${
            marketData.connected ? "text-green-400" : "text-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${
              marketData.connected ? "bg-green-400" : "bg-red-400"
            }`}
          />

          {marketData.connected ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      {/* Market + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 shrink-0">
        {/* Market Information */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-orange-500/20 rounded-lg p-5 shadow-[0_0_25px_rgba(247,147,26,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold tracking-[0.2em] text-orange-400">
              MARKET OVERVIEW
            </h2>

            <span className="text-[10px] text-gray-600 tracking-widest">
              BTC/USDT
            </span>
          </div>

          <div className="mb-4">
            <p className="text-gray-500 text-xs tracking-widest">BTC / USDT</p>

            <div className="flex items-end gap-3 mt-1">
              <h2 className="text-3xl font-black tracking-tight text-white">
                $
                {marketData.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>

              <span className="text-orange-400 text-xs pb-1">LIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            {/* 1m High */}
            <div className="py-3 border-t border-gray-800/80">
              <p className="text-gray-600 text-[10px] uppercase tracking-widest">
                1m High
              </p>

              <p className="font-medium mt-1 text-gray-200">
                $
                {marketData.high.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* 1m Low */}
            <div className="py-3 border-t border-gray-800/80">
              <p className="text-gray-600 text-[10px] uppercase tracking-widest">
                1m Low
              </p>

              <p className="font-medium mt-1 text-gray-200">
                $
                {marketData.low.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* 1m Volume */}
            <div className="py-3 border-t border-gray-800/80">
              <p className="text-gray-600 text-[10px] uppercase tracking-widest">
                1m Volume
              </p>

              <p className="font-medium mt-1 text-gray-200">
                {marketData.volume.toFixed(4)} BTC
              </p>
            </div>

            {/* Market Status */}
            <div className="py-3 border-t border-gray-800/80">
              <p className="text-gray-600 text-[10px] uppercase tracking-widest">
                Market Status
              </p>

              <p
                className={`font-bold mt-1 ${
                  marketData.connected ? "text-green-400" : "text-red-400"
                }`}
              >
                {marketData.connected ? "Live" : "Disconnected"}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-3 bg-[#0a0a0a] border border-orange-500/20 rounded-lg p-5 shadow-[0_0_25px_rgba(247,147,26,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold tracking-[0.2em] text-orange-400">
                BTC / USDT
              </h2>

              <p className="text-gray-600 text-[10px] mt-1 tracking-widest uppercase">
                Live price movement
              </p>
            </div>

            <span className="text-[10px] font-bold text-orange-400 border border-orange-500/30 px-2 py-1 rounded">
              1H
            </span>
          </div>

          <div className="h-56 rounded-md border border-gray-800/70 bg-[#070707] p-2">
            <BTCChart />
          </div>
        </div>
      </div>

      {/* AI Intelligence */}
      <div className="flex-1 min-h-0">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-xs font-bold tracking-[0.2em] text-orange-400">
            AI INTELLIGENCE
          </h2>

          <div className="h-px flex-1 bg-orange-500/15" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Prediction */}
          <div className="bg-[#0a0a0a] border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-[10px] uppercase tracking-widest">
                📈 Prediction
              </p>

              <span className="flex items-center gap-1 text-[10px] text-green-400 tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_7px_rgba(74,222,128,0.8)]" />
                LIVE
              </span>
            </div>

            {predictionLoading ? (
              <p className="text-lg font-semibold mt-2 text-gray-500">
                Loading...
              </p>
            ) : prediction ? (
              <>
                <p
                  className={`text-lg font-black mt-2 ${
                    prediction.prediction === "UP"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {prediction.prediction === "UP" ? "↑ UP" : "↓ DOWN"}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-gray-600 text-[10px] tracking-widest">
                      UP
                    </p>

                    <p className="text-sm font-bold text-green-400">
                      {(prediction.up_probability * 100).toFixed(2)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-[10px] tracking-widest">
                      DOWN
                    </p>

                    <p className="text-sm font-bold text-red-400">
                      {(prediction.down_probability * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-[10px] mt-3">
                  Updated{" "}
                  {predictionUpdatedAt
                    ? predictionUpdatedAt.toLocaleTimeString()
                    : "--"}
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold mt-2 text-gray-500">
                Unavailable
              </p>
            )}
          </div>

          {/* Whale Activity */}
          <div className="bg-[#0a0a0a] border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-colors">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              🐋 Whale Activity
            </p>

            <p className="text-lg font-black mt-2 text-gray-200">Normal</p>

            <p className="text-gray-600 text-[10px] mt-1">No major movement</p>
          </div>

          {/* Anomalies */}
          <div className="bg-[#0a0a0a] border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                ⚠️ Anomalies
              </h3>

              {anomaly && (
                <span
                  className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${
                    anomaly.is_anomaly
                      ? "bg-red-500 text-red-500"
                      : "bg-green-500 text-green-500"
                  }`}
                />
              )}
            </div>

            {anomalyLoading ? (
              <div className="mt-4 text-sm text-gray-500">Detecting...</div>
            ) : anomaly ? (
              <>
                <div className="mt-3">
                  <p
                    className={`text-xl font-black ${
                      anomaly.is_anomaly ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {anomaly.severity}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-600">
                    {anomaly.is_anomaly
                      ? "Unusual market behavior detected"
                      : "No unusual market behavior"}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>Anomaly Score</span>
                    <span className="text-gray-400">
                      {Number(anomaly.anomaly_score).toFixed(4)}
                    </span>
                  </div>

                  <div className="mt-1 flex justify-between text-[10px] text-gray-600">
                    <span>Threshold</span>
                    <span className="text-gray-400">
                      {Number(anomaly.threshold).toFixed(4)}
                    </span>
                  </div>
                </div>

                {anomalyUpdatedAt && (
                  <p className="mt-3 text-[10px] text-gray-700">
                    Updated{" "}
                    {anomalyUpdatedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                )}
              </>
            ) : (
              <div className="mt-4 text-sm text-gray-500">No anomaly data</div>
            )}
          </div>

          {/* Sentiment */}
          <div className="bg-[#0a0a0a] border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-colors">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">
              🧠 Sentiment
            </p>

            <p className="text-lg font-black text-green-400 mt-2">Bullish</p>

            <p className="text-gray-600 text-[10px] mt-1">Score: 72 / 100</p>
          </div>

          {/* Risk */}
          <div className="bg-[#0a0a0a] border border-orange-500/20 rounded-lg p-4 hover:border-orange-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                🛡️ Risk Analysis
              </h3>

              {risk && (
                <span
                  className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${
                    risk.is_high_risk
                      ? "bg-red-500 text-red-500"
                      : "bg-green-500 text-green-500"
                  }`}
                />
              )}
            </div>

            {riskLoading ? (
              <div className="mt-4 text-sm text-gray-500">Analyzing...</div>
            ) : risk ? (
              <>
                <div className="mt-3">
                  <p
                    className={`text-xl font-black ${
                      risk.is_high_risk ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {risk.risk_level}
                  </p>

                  <p className="mt-1 text-[10px] text-gray-600">
                    {risk.is_high_risk
                      ? "High market risk detected"
                      : "Market risk is currently normal"}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-gray-600">
                    <span>High Risk</span>
                    <span className="text-red-400">
                      {(risk.high_risk_probability * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-1 flex justify-between text-[10px] text-gray-600">
                    <span>Normal</span>
                    <span className="text-green-400">
                      {(risk.normal_probability * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-1 flex justify-between text-[10px] text-gray-600">
                    <span>Threshold</span>
                    <span className="text-orange-400">
                      {(risk.threshold * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {riskUpdatedAt && (
                  <p className="mt-3 text-[10px] text-gray-700">
                    Updated{" "}
                    {riskUpdatedAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                )}
              </>
            ) : (
              <div className="mt-4 text-sm text-gray-500">No risk data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
