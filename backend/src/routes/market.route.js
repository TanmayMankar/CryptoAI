const express = require("express");
const marketController = require("../controllers/market.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
    "/klines",
    authMiddleware,
    marketController.getKlines
);

module.exports = router;