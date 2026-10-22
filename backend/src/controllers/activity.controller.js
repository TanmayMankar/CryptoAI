
const { getActivityHistoricalKlines } = require("../services/binance.service");
const { getActivityPrediction } = require("../services/activity.service");
const Activity = require("../models/activity.model");

async function predictActivity(req, res) {
  try {
    const candles = await getActivityHistoricalKlines();
    const result = await getActivityPrediction(candles);

    // Use the current minute as the snapshot key.
    const timeBucket = Math.floor(Date.now() / 60000);

    // Save one snapshot per minute. Repeated requests update
    // that minute's record instead of creating duplicates.
    await Activity.findOneAndUpdate(
      { time_bucket: timeBucket },
      {
        $set: {
          symbol: "BTCUSDT",
          activity_probability: result.activity_probability,
          alert_threshold: result.alert_threshold,
          high_activity: result.high_activity,
          candles_used: candles.length,
        },
        $setOnInsert: {
          time_bucket: timeBucket,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: result,
      candlesUsed: candles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Activity prediction controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to predict market activity",
      error: error.message,
    });
  }
}

module.exports = { predictActivity };
