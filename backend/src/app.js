const express = require('express');
const cors = require('cors');
const authRoutes = require("./routes/auth.route")
const cookieParser = require("cookie-parser")
const marketRoutes = require("./routes/market.route");


const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRoutes)
app.use("/api/market", marketRoutes);


module.exports = app;