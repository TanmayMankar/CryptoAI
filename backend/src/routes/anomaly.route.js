const express = require("express");
const anomalyController = require("../controllers/anomaly.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    anomalyController.detectAnomaly
);

module.exports = router;