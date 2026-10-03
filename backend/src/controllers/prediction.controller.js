const { getHistoricalKlines } = require("../services/binance.service");
const { getPrediction } = require("../services/prediction.service");
const Prediction = require("../models/prediction.model");

const predictBTC = async (req, res) => {
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

    const prediction = await getPrediction(mlCandles);

    // Latest candle used for this prediction
    const latestCandle = candles[candles.length - 1];

    // Save prediction to MongoDB
    const existingPrediction = await Prediction.findOne({
      candle_open_time: latestCandle.openTime,
    });

    if (!existingPrediction) {
      await Prediction.create({
        symbol: "BTCUSDT",
        prediction: prediction.prediction,
        up_probability: prediction.up_probability,
        down_probability: prediction.down_probability,
        candle_open_time: latestCandle.openTime,
        candle_close_time: latestCandle.closeTime,
      });
    }

    res.json({
      symbol: "BTCUSDT",
      prediction,
    });
  } catch (error) {
    console.error("BTC prediction error:", error);

    res.status(500).json({
      message: "Failed to generate BTC prediction",
      error: error.message,
    });
  }
};

const getPredictionHistory = async (req, res) => {
  try {
    const history = await Prediction.find({
      symbol: "BTCUSDT",
    })
      .sort({ candle_open_time: -1 })
      .limit(5);

    res.json({
      symbol: "BTCUSDT",
      history,
    });
  } catch (error) {
    console.error("Prediction history error:", error);

    res.status(500).json({
      message: "Failed to fetch prediction history",
      error: error.message,
    });
  }
};

module.exports = {
  predictBTC,
  getPredictionHistory,
};
