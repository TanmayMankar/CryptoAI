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

      // console.log("Dashboard Live BTC Data:", candle);

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
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-xs">📈 Prediction</p>

              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                LIVE
              </span>
            </div>

            {predictionLoading ? (
              <p className="text-lg font-semibold mt-2 text-gray-400">
                Loading...
              </p>
            ) : prediction ? (
              <>
                <p
                  className={`text-lg font-semibold mt-2 ${
                    prediction.prediction === "UP"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {prediction.prediction === "UP" ? "↑ UP" : "↓ DOWN"}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-gray-500 text-xs">UP</p>
                    <p className="text-sm font-medium text-green-400">
                      {(prediction.up_probability * 100).toFixed(2)}%
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs">DOWN</p>
                    <p className="text-sm font-medium text-red-400">
                      {(prediction.down_probability * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <p className="text-gray-500 text-xs mt-3">
                  Updated{" "}
                  {predictionUpdatedAt
                    ? predictionUpdatedAt.toLocaleTimeString()
                    : "--"}
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold mt-2 text-gray-400">
                Unavailable
              </p>
            )}
          </div>

          {/* Whale Activity */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs">🐋 Whale Activity</p>

            <p className="text-lg font-semibold mt-2">Normal</p>

            <p className="text-gray-500 text-xs mt-1">No major movement</p>
          </div>

          {/* Anomalies */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">
                ⚠️ Anomalies
              </h3>

              {anomaly && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    anomaly.is_anomaly ? "bg-red-500" : "bg-green-500"
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
                    className={`text-2xl font-bold ${
                      anomaly.is_anomaly ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {anomaly.severity}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {anomaly.is_anomaly
                      ? "Unusual market behavior detected"
                      : "No unusual market behavior"}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Anomaly Score</span>
                    <span>{Number(anomaly.anomaly_score).toFixed(4)}</span>
                  </div>

                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Threshold</span>
                    <span>{Number(anomaly.threshold).toFixed(4)}</span>
                  </div>
                </div>

                {anomalyUpdatedAt && (
                  <p className="mt-3 text-xs text-gray-600">
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
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-xs">🧠 Sentiment</p>

            <p className="text-lg font-semibold text-green-400 mt-2">Bullish</p>

            <p className="text-gray-500 text-xs mt-1">Score: 72 / 100</p>
          </div>

          {/* Risk */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-300">
                🛡️ Risk Analysis
              </h3>

              {risk && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    risk.is_high_risk ? "bg-red-500" : "bg-green-500"
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
                    className={`text-2xl font-bold ${
                      risk.is_high_risk ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {risk.risk_level}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {risk.is_high_risk
                      ? "High market risk detected"
                      : "Market risk is currently normal"}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>High Risk</span>
                    <span>
                      {(risk.high_risk_probability * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Normal</span>
                    <span>{(risk.normal_probability * 100).toFixed(2)}%</span>
                  </div>

                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Threshold</span>
                    <span>{(risk.threshold * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {riskUpdatedAt && (
                  <p className="mt-3 text-xs text-gray-600">
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
