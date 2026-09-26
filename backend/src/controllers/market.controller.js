const { getHistoricalKlines } = require("../services/binance.service");

const getKlines = async (req, res) => {
    try {
        const klines = await getHistoricalKlines();

        res.json({
            symbol: "BTCUSDT",
            interval: "1m",
            data: klines,
        });

    } catch (error) {
        console.error("Failed to fetch historical klines:", error);

        res.status(500).json({
            message: "Failed to fetch historical market data",
        });
    }
};

module.exports = {
    getKlines,
};