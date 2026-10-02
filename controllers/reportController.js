const Expense = require("../models/expenseModel");

const getMonthlyReport = async (req, res) => {
    try {
        const { month } = req.query;

        const [year, monthNumber] = month.split("-");
        const startDate = new Date(
            `${year}-${monthNumber}-01T00:00:00.000Z`
        );
        const endDate = new Date(startDate);
        endDate.setUTCMonth(endDate.getUTCMonth() + 1);

        const expenses = await Expense.find({
            userId: req.user._id,
            date: {
                $gte: startDate,
                $lt: endDate
            }
        })
            .populate("categoryId", "categoryName type")
            .sort({ date: 1 });

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
            .reduce((sum, expense) => sum + expense.amount, 0);

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

        const categoryData = Object.entries(categoryTotal).map(
            ([name, value]) => ({
                name,
                value
            })
        );

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                balance,
                categoryData,
                expenses: expenses.filter((expense) => expense.type === "expense")
            },
            message: "Monthly report fetched successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    getMonthlyReport
};