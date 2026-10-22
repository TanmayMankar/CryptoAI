
const { getHistoricalKlines } = require("../services/binance.service");
const { getAnomaly } = require("../services/anomaly.service");
const Anomaly = require("../models/anomaly.model");

const detectAnomaly = async (req, res) => {
    try {
        const candles = await getHistoricalKlines();

        if (!candles || candles.length < 16) {
            return res.status(400).json({
                message: "Not enough candle data for anomaly detection",
            });
        }

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

        const result = await getAnomaly(mlCandles);

        if (result.status !== "ok") {
            return res.status(502).json({
                message: "ML anomaly prediction failed",
                result,
            });
        }

        const latestCandle = candles[candles.length - 1];

        const existingAnomaly = await Anomaly.findOne({
            candle_open_time: latestCandle.openTime,
        });

        const anomalyRecord = {
            symbol: "BTCUSDT",
            anomaly_score: result.score,
            is_anomaly: result.anomaly,
            severity: result.severity,
            threshold: result.threshold,
            candle_open_time: latestCandle.openTime,
            candle_close_time: latestCandle.closeTime,
        };

        if (!existingAnomaly) {
            await Anomaly.create(anomalyRecord);
        }

        return res.json({
            symbol: "BTCUSDT",
            anomaly: {
                ...result,
                anomaly_score: result.score,
                is_anomaly: result.anomaly,
            },
        });
    } catch (error) {
        console.error("BTC anomaly detection error:", error);

        return res.status(500).json({
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

        return res.json({
            symbol: "BTCUSDT",
            history,
        });
    } catch (error) {
        console.error("Anomaly history error:", error);

        return res.status(500).json({
            message: "Failed to fetch anomaly history",
            error: error.message,
        });
    }
};

module.exports = {
    detectAnomaly,
    getAnomalyHistory,
};
