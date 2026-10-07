const express = require("express");
const riskController = require("../controllers/risk.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    riskController.predictRisk
);


router.get(
  "/history",
  authMiddleware,
  riskController.getRiskHistory
);

module.exports = router;