const express = require('express');
const cors = require('cors');
const authRoutes = require("./routes/auth.route")
const cookieParser = require("cookie-parser")
const marketRoutes = require("./routes/market.route");
const predictionRoutes = require(
    "./routes/prediction.route"
);
const anomalyRoutes = require("./routes/anomaly.route");
const riskRoutes = require("./routes/risk.route");


const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRoutes)
app.use("/api/market", marketRoutes);
app.use(
    "/api/prediction",
    predictionRoutes
);
app.use("/api/anomaly", anomalyRoutes);
app.use("/api/risk", riskRoutes);


module.exports = app;