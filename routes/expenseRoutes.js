const express = require("express");

const router = express.Router();

const {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getDashboardData
} = require("../controllers/expenseController");

const authMiddleware = require("../middleware/authMiddleware");

// Dashboard
router.get("/dashboard", authMiddleware, getDashboardData);

// Create
router.post("/", authMiddleware, createExpense);

// Get all
router.get("/", authMiddleware, getExpenses);

// Get by ID
router.get("/:id", authMiddleware, getExpenseById);

// Update
router.put("/:id", authMiddleware, updateExpense);

// Delete
router.delete("/:id", authMiddleware, deleteExpense);


module.exports = router;