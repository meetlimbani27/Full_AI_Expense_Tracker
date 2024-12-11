// db/index.js
const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Other options as needed
        });
        logger.info('MongoDB connected successfully.');
    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
