const { getHistoricalKlines } = require("../services/binance.service");
const { getRisk } = require("../services/risk.service");
const Risk = require("../models/risk.model");

const predictRisk = async (req, res) => {
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

    const risk = await getRisk(mlCandles);

    const latestCandle = candles[candles.length - 1];

    const existingRisk = await Risk.findOne({
      candle_open_time: latestCandle.openTime,
    });

    if (!existingRisk) {
      await Risk.create({
        symbol: "BTCUSDT",
        high_risk_probability: risk.high_risk_probability,
        normal_probability: risk.normal_probability,
        risk_level: risk.risk_level,
        is_high_risk: risk.is_high_risk,
        threshold: risk.threshold,
        candle_open_time: latestCandle.openTime,
        candle_close_time: latestCandle.closeTime,
      });
    }   

    res.json({
      symbol: "BTCUSDT",
      risk,
    });
  } catch (error) {
    console.error("BTC risk prediction error:", error);

    res.status(500).json({
      message: "Failed to predict BTC risk",
      error: error.message,
    });
  }
};


const getRiskHistory = async (req, res) => {
  try {
    const history = await Risk.find({
      symbol: "BTCUSDT",
    })
      .sort({ candle_open_time: -1 })
      .limit(5);

    res.json({
      symbol: "BTCUSDT",
      history,
    });
  } catch (error) {
    console.error("Risk history error:", error);

    res.status(500).json({
      message: "Failed to fetch risk history",
      error: error.message,
    });
  }
};

module.exports = {
  predictRisk,
  getRiskHistory,
};
