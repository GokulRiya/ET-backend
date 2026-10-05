const Expense = require("../models/expenseModel");

const cleanupOldExpenses = async () => {
    try {
        const now = new Date();

        const deleteBefore = new Date(
            now.getFullYear(),
            now.getMonth() - 2,
            1
        );

        console.log("Current date:", now);
        console.log("Delete before:", deleteBefore);

        const result = await Expense.deleteMany({
            date: {
                $lt: deleteBefore
            }
        });

        console.log(
            `Old income/expenses deleted: ${result.deletedCount}`
        );

    } catch (error) {
        console.error("Cleanup failed:", error.message);
    }
};

module.exports = cleanupOldExpenses;