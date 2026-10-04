const { getHistoricalKlines } = require("../services/binance.service");
const { getAnomaly } = require("../services/anomaly.service");
const Anomaly = require("../models/anomaly.model");

const detectAnomaly = async (req, res) => {
  try {
    const candles = await getHistoricalKlines();

    const mlCandles = candles.map((candle) => ({
      open_time: candle.openTime,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      number_of_trades: candle.trades,
      taker_buy_base_volume: candle.takerBuyBaseVolume,
    }));

    const anomaly = await getAnomaly(mlCandles);

    const latestCandle = candles[candles.length - 1];

    const existingAnomaly = await Anomaly.findOne({
      candle_open_time: latestCandle.openTime,
    });

    if (!existingAnomaly) {
      await Anomaly.create({
        symbol: "BTCUSDT",
        anomaly_score: anomaly.anomaly_score,
        is_anomaly: anomaly.is_anomaly,
        severity: anomaly.severity,
        threshold: anomaly.threshold,
        candle_open_time: latestCandle.openTime,
        candle_close_time: latestCandle.closeTime,
      });
    }

    res.json({
      symbol: "BTCUSDT",
      anomaly,
    });
  } catch (error) {
    console.error("BTC anomaly detection error:", error);

    res.status(500).json({
      message: "Failed to detect BTC anomaly",
      error: error.message,
    });
  }
};



const getAnomalyHistory = async (req, res) => {
  try {
    const history = await Anomaly.find({
      symbol: "BTCUSDT",
    })
      .sort({ candle_open_time: -1 })
      .limit(5);

    res.json({
      symbol: "BTCUSDT",
      history,
    });
  } catch (error) {
    console.error("Anomaly history error:", error);

    res.status(500).json({
      message: "Failed to fetch anomaly history",
      error: error.message,
    });
  }
};

module.exports = {
  detectAnomaly,
  getAnomalyHistory,
};
