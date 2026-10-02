const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        categoryName: {
            type: String,
            trim: true,
            required: true
        },
        type: {
            type: String,
            enum: ["income", "expense"]
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Category", categorySchema);