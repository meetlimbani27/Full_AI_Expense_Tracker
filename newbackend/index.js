'use strict';

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./db/index');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8000;
app.use(cors()); 
app.use(express.json());


//Routes
const aQueryRoutes = require('./app/aQuery/aQueryRoutes');
app.use('/api/aQuery', aQueryRoutes);




// Start Server
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};
startServer();

