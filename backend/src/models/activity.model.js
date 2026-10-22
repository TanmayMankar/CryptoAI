
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      default: "BTCUSDT",
    },

    activity_probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    alert_threshold: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    high_activity: {
      type: Boolean,
      required: true,
    },

    candles_used: {
      type: Number,
      required: true,
    },

    // One snapshot per minute, even if both the dashboard
    // and Whale Activity page request a prediction.
    time_bucket: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);
