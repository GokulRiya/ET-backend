const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const expenseRoutes = require("./routes/expenseRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
app.use(cors(
    {
        // "origin": "*",
    }
));
app.use(express.json());

// connect database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User CRUD API is running'
    })
});

// connect server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server port is running in ${port}`);
});