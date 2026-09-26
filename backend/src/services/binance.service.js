const WebSocket = require("ws");

const BINANCE_WS_URL =
    "wss://stream.binance.com:9443/ws/btcusdt@kline_1m";

let binanceSocket = null;

function startBinanceStream(broadcast) {
    console.log("Connecting to Binance Kline WebSocket...");

    binanceSocket = new WebSocket(BINANCE_WS_URL);

    binanceSocket.on("open", () => {
        console.log("Connected to Binance Kline WebSocket");
    });

    binanceSocket.on("message", (data) => {
        const message = JSON.parse(data);

        const kline = message.k;

        const candle = {
            openTime: kline.t,
            closeTime: kline.T,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v),
            trades: kline.n,
            isClosed: kline.x,
        };

        broadcast(candle);

        // console.log(candle);
    });

    binanceSocket.on("error", (error) => {
        console.error(
            "Binance Kline WebSocket error:",
            error.message
        );
    });

    binanceSocket.on("close", () => {
        console.log("Binance Kline WebSocket disconnected");
    });
}


async function getHistoricalKlines() {
    const url =
        "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Binance REST API error: ${response.status}`
        );
    }

    const data = await response.json();

    return data.map((kline) => ({
        openTime: kline[0],
        closeTime: kline[6],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        trades: kline[8],
        isClosed: true,
    }));
}

module.exports = {
    startBinanceStream,
    getHistoricalKlines,
};