const User = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret_key = process.env.JWT_SECRET;

// User register
const userRegister = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        // Already exits
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists'
            })
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // New user register
        const newUser = await User({
            name,
            email,
            password: hashPassword,
            role
        });
        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User Registered successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User Register failed",
            error: error.message
        });
    }
}

// User login
const userLogin = async (req, res) => {
    const { email, password } = req.body;

    console.time("LOGIN TOTAL");

    try {
        console.time("FIND USER");
        const user = await User.findOne({ email });
        console.timeEnd("FIND USER");

        if (!user) {
            console.timeEnd("LOGIN TOTAL");

            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        console.time("Password Compare");
        const match = await bcrypt.compare(password, user.password);
        console.timeEnd("Password Compare");

        if (!match) {
            console.timeEnd("LOGIN TOTAL");

            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        console.time("JWT");
        const token = jwt.sign(
            { user: user._id, role: user.role },
            secret_key,
            { expiresIn: "1m" }
        );
        console.timeEnd("JWT");

        console.timeEnd("LOGIN TOTAL");

        res.json({
            token,
            role: user.role,
            email: user.email,
            name: user.name || ''
        });

    } catch (error) {
        console.timeEnd("LOGIN TOTAL");

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

// Get Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            data: users,
            message: "User fetch successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'User fetch failed'
        });
    }
}

module.exports = { userRegister, userLogin, getAllUsers };