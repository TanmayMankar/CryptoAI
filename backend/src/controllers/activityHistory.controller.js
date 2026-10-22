
const Activity = require("../models/activity.model");

async function getActivityHistory(req, res) {
  try {
    const history = await Activity.find()
      .sort({ time_bucket: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Activity history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity history",
    });
  }
}

module.exports = { getActivityHistory };
