const { getHistoricalKlines } = require("../services/binance.service");
const { getAnomaly } = require("../services/anomaly.service");

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
            taker_buy_base_volume:
                candle.takerBuyBaseVolume,
        }));

        const anomaly = await getAnomaly(mlCandles);

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

module.exports = {
    detectAnomaly,
};