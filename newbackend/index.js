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
const chatQueryRoutes = require('./app/chatQuery/chatQueryRoutes');
app.use('/api/chatQuery', chatQueryRoutes);




// Start Server
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            connectDB().then(() => {
                // Start your server or continue with your application
              }).catch((error) => {
                console.error('Error connecting to MongoDB:', error);
                process.exit(1); // Exit process with failure
              });
        });
        console.log('**************************************************\n\n')
    } catch (error) {
        console.error('Error starting server:', error);
    }
};
startServer();

