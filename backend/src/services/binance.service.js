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
            quoteVolume: parseFloat(kline.q),
            trades: kline.n,
            takerBuyBaseVolume: parseFloat(kline.V),
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
        "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=120";

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
        quoteVolume: parseFloat(kline[7]),
        trades: kline[8],
        takerBuyBaseVolume: parseFloat(kline[9]),
        isClosed: true,
    }));
}




async function getActivityHistoricalKlines() {
    const baseUrl =
        "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m";

    async function fetchKlines(limit, endTime) {
        const params = new URLSearchParams({
            limit: String(limit),
        });

        if (endTime !== undefined) {
            params.set("endTime", String(endTime));
        }

        const response = await fetch(`${baseUrl}&${params.toString()}`);

        if (!response.ok) {
            throw new Error(
                `Binance activity history API error: ${response.status}`
            );
        }

        return response.json();
    }

    // Fetch the most recent candles first.
    const recent = await fetchKlines(1000);

    if (recent.length === 0) {
        throw new Error("Binance returned no recent candles");
    }

    // Fetch older candles ending immediately before the oldest recent candle.
    const older = await fetchKlines(600, recent[0][0] - 1);

    const data = [...older, ...recent];

    const candles = data.map((kline) => ({
        openTime: kline[0],
        closeTime: kline[6],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        quoteVolume: parseFloat(kline[7]),
        trades: Number(kline[8]),
        takerBuyBaseVolume: parseFloat(kline[9]),
        isClosed: true,
    }));

    candles.sort((a, b) => a.openTime - b.openTime);

    // Exclude the current, unfinished minute.
    const now = Date.now();
    const completed = candles.filter(
        (candle) => candle.closeTime < now
    );

    // Verify that enough continuous history remains.
    if (completed.length < 1501) {
        throw new Error(
            `Insufficient completed candles: ${completed.length}`
        );
    }

    for (let i = 1; i < completed.length; i++) {
        if (completed[i].openTime - completed[i - 1].openTime !== 60000) {
            throw new Error(
                "Missing minute in activity history; refusing to predict"
            );
        }
    }

    return completed;
}



module.exports = {
    startBinanceStream,
    getHistoricalKlines,
    getActivityHistoricalKlines,
};