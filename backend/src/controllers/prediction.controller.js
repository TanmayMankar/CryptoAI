const { getHistoricalKlines } = require("../services/binance.service");

const { getPrediction } = require("../services/prediction.service");

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

module.exports = {
  predictBTC,
};
