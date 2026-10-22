
const express = require("express");
const activityController = require("../controllers/activity.controller");
const activityHistoryController = require("../controllers/activityHistory.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/history",
  authMiddleware,
  activityHistoryController.getActivityHistory
);

router.get(
  "/",
  authMiddleware,
  activityController.predictActivity
);

module.exports = router;
