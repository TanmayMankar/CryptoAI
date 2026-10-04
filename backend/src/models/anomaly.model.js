const mongoose = require("mongoose");

const anomalySchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      default: "BTCUSDT",
    },

    anomaly_score: {
      type: Number,
      required: true,
    },

    is_anomaly: {
      type: Boolean,
      required: true,
    },

    severity: {
      type: String,
      required: true,
      enum: ["NORMAL", "MODERATE", "HIGH", "EXTREME"],
    },

    threshold: {
      type: Number,
      required: true,
    },

    candle_open_time: {
      type: Number,
      required: true,
      unique: true,
    },

    candle_close_time: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Anomaly", anomalySchema);