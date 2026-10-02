const mongoose = require('mongoose')

const authSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            required: true
        },
        password: {
            type: String,
            trim: true,
            required: true
        },
        role: {
            type: String,
            enum: ['user'],
            default: 'user'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", authSchema);