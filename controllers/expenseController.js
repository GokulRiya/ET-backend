const Expense = require("../models/expenseModel");
const Category = require("../models/categoryModel");

// Create Expense / Income
const createExpense = async (req, res) => {
    const {
        categoryId,
        date,
        amount,
        description
    } = req.body;

    try {

        // Check category belongs to logged-in user
        const category = await Category.findOne({
            _id: categoryId,
            userId: req.user._id
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Type comes from category
        const expense = await Expense.create({
            userId: req.user._id,
            categoryId: category._id,
            type: category.type,
            date,
            amount,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Expense created successfully",
            data: expense
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Expense create failed",
            error: error.message
        });
    }
};

// Get All
const getExpenses = async (req, res) => {
    try {
        const search = req.query.search?.trim();
        const filter = { userId: req.user._id };
        // month
        const month = req.query.month;
        if (month) {
            const [year, monthNumber] = month.split("-");

            const startDate = new Date(`${year}-${monthNumber}-01T00:00:00.000Z`);
            const endDate = new Date(startDate);
            endDate.setUTCMonth(endDate.getUTCMonth() + 1);

            filter.date = {
                $gte: startDate,
                $lt: endDate
            };
        }

        // Search by description, type, category name, or amount
        if (search) {
            const searchRegex = new RegExp(
                search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );
            const matchingCategories = await Category.find({
                userId: req.user._id,
                categoryName: searchRegex
            }).select("_id");

            filter.$or = [
                { description: searchRegex },
                { type: searchRegex },
                { categoryId: { $in: matchingCategories.map((category) => category._id) } }
            ];

            const amount = Number(search);
            if (Number.isFinite(amount)) {
                filter.$or.push({ amount });
            }
        }

        const expenses = await Expense.find(filter)
            .populate("categoryId", "categoryName type")
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            data: expenses,
            message: "Expenses fetched successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Expense fetch failed",
            error: error.message
        });
    }
};

// Get By Id
const getExpenseById = async (req, res) => {
    try {

        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate("categoryId", "categoryName type");

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: expense
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch expense",
            error: error.message
        });
    }
};

// Update Expense
const updateExpense = async (req, res) => {
    const {
        categoryId,
        date,
        amount,
        description
    } = req.body;

    try {

        // Check existing transaction
        const expense = await Expense.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        // Check new category
        const category = await Category.findOne({
            _id: categoryId,
            userId: req.user._id
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        expense.categoryId = category._id;
        expense.type = category.type;
        expense.date = date;
        expense.amount = amount;
        expense.description = description;

        await expense.save();

        return res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            data: expense
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Transaction update failed",
            error: error.message
        });
    }
};

// Delete Expense
const deleteExpense = async (req, res) => {
    try {

        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Expense delete failed",
            error: error.message
        });
    }
};

const getDashboardData = async (req, res) => {
    try {
        const { month } = req.query;

        const filter = {
            userId: req.user._id
        };

        // Month filter
        if (month) {
            const [year, monthNumber] = month.split("-");

            const startDate = new Date(
                `${year}-${monthNumber}-01T00:00:00.000Z`
            );

            const endDate = new Date(startDate);
            endDate.setUTCMonth(endDate.getUTCMonth() + 1);

            filter.date = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const expenses = await Expense.find(filter)
            .populate("categoryId", "categoryName type");

        // Total Income
        const totalIncome = expenses
            .filter((expense) => expense.type === "income")
            .reduce(
                (sum, expense) => sum + expense.amount,
                0
            );

        // Total Expense
        const totalExpense = expenses
            .filter((expense) => expense.type === "expense")
            .reduce(
                (sum, expense) => sum + expense.amount,
                0
            );

        // Balance
        const balance = totalIncome - totalExpense;

        // Category-wise Expense
        const categoryTotal = expenses
            .filter((expense) => expense.type === "expense")
            .reduce((acc, expense) => {
                const categoryName =
                    expense.categoryId.categoryName;

                acc[categoryName] =
                    (acc[categoryName] || 0) + expense.amount;

                return acc;
            }, {});

        const chartData = Object.entries(categoryTotal).map(
            ([name, value]) => ({
                name,
                value
            })
        );


        let dayWise = expenses
            .filter((expense) => expense.type === "expense")
            .reduce((acc, expense) => {
                const date = expense.date.toISOString().split("T")[0];
                acc[date] = (acc[date] || 0) + expense.amount;
                return acc;
            }, {});

        const dayWiseExpenses = Object.entries(dayWise).map(
            ([name, value]) => ({
                name,
                value
            })
        );

        return res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                balance,
                chartData,
                expenses: dayWiseExpenses
            },
            message: "Dashboard data fetched successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Dashboard data fetch failed",
            error: error.message
        });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getDashboardData
};