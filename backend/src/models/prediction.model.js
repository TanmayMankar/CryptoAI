const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      default: "BTCUSDT",
    },

    prediction: {
      type: String,
      required: true,
      enum: ["UP", "DOWN"],
    },

    up_probability: {
      type: Number,
      required: true,
    },

    down_probability: {
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

module.exports = mongoose.model("Prediction", predictionSchema);