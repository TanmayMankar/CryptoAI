const { getHistoricalKlines } = require("../services/binance.service");
const { getRisk } = require("../services/risk.service");

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
            taker_buy_base_volume:
                candle.takerBuyBaseVolume,
        }));

        const risk = await getRisk(mlCandles);

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

module.exports = {
    predictRisk,
};