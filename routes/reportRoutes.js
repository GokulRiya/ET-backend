const express = require("express");
const router = express.Router();

const { getMonthlyReport } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

// Get Monthly Report
router.get("/monthly", authMiddleware, getMonthlyReport);

module.exports = router;