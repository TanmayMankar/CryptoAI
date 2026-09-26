require("dotenv").config();

const http = require("http");
const WebSocket = require("ws");

const app = require("./src/app");
const connectDB = require("./src/db/db");
const { startBinanceStream } = require("./src/services/binance.service");

connectDB();

const server = http.createServer(app);

const wss = new WebSocket.Server({
    server,
});

const clients = new Set();

wss.on("connection", (socket) => {
    console.log("Frontend WebSocket connected");

    clients.add(socket);

    socket.on("close", () => {
        console.log("Frontend WebSocket disconnected");
        clients.delete(socket);
    });
});

function broadcast(data) {
    const message = JSON.stringify(data);

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

startBinanceStream(broadcast);

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});