const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.time("MongoDB Connection");

        const connection = await mongoose.connect(process.env.MONGO_URI);

        console.timeEnd("MongoDB Connection");

        console.log(
            `MongoDB Connected ${connection.connection.host}`
        );

    } catch (error) {
        console.log(`Connection failed ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;