import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function BTCChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/market/klines",
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch historical data");
        }

        const result = await response.json();

        const historicalData = result.data.map((candle) => ({
          time: new Date(candle.openTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          price: candle.close,
          high: candle.high,
          low: candle.low,
          openTime: candle.openTime,
        }));

        console.log("Historical BTC Data:", historicalData);

        setData(historicalData);
      } catch (error) {
        console.error("Historical data error:", error);
      }
    };

    loadHistoricalData();

    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Connected to backend WebSocket");
    };

    socket.onmessage = (event) => {
      const candle = JSON.parse(event.data);

      console.log("Live BTC Data:", candle);

      const newPoint = {
        time: new Date(candle.openTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: candle.close,
        high: candle.high,
        low: candle.low,
        openTime: candle.openTime,
      };

      setData((previousData) => {
        const existingIndex = previousData.findIndex(
          (item) => item.openTime === candle.openTime,
        );

        // Update existing candle
        if (existingIndex !== -1) {
          const updatedData = [...previousData];

          updatedData[existingIndex] = newPoint;

          return updatedData;
        }

        // Add new candle and keep latest 60
        return [...previousData, newPoint].slice(-60);
      });
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Backend WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />

        <YAxis
          domain={["auto", "auto"]}
          stroke="#6b7280"
          tick={{ fontSize: 11 }}
          width={65}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #374151",
            borderRadius: "8px",
          }}
        />

        <Legend />

        {/* Current BTC Price */}
        <Line
          type="monotone"
          dataKey="price"
          name="BTC Price"
          stroke="#22c55e"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />

        {/* High */}
        <Line
          type="monotone"
          dataKey="high"
          name="High"
          stroke="#60a5fa"
          strokeWidth={2}
          strokeDasharray="6 6"
          dot={false}
        />

        {/* Low */}
        <Line
          type="monotone"
          dataKey="low"
          name="Low"
          stroke="#f87171"
          strokeWidth={2}
          strokeDasharray="6 6"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default BTCChart;
