const mongoose = require("mongoose");

const riskSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      default: "BTCUSDT",
    },

    high_risk_probability: {
      type: Number,
      required: true,
    },

    normal_probability: {
      type: Number,
      required: true,
    },

    risk_level: {
      type: String,
      required: true,
      enum: ["NORMAL", "MODERATE", "HIGH", "EXTREME"],
    },

    is_high_risk: {
      type: Boolean,
      required: true,
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

module.exports = mongoose.model("Risk", riskSchema);