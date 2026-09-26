const express = require("express");

const predictionController = require(
    "../controllers/prediction.controller"
);

const authMiddleware = require(
    "../middlewares/auth.middleware"
);

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    predictionController.predictBTC
);

module.exports = router;