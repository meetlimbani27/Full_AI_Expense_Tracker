// index.js
'use strict';

const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./db/index');
const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 8000;
const errorHandler = require('./middleware/errorHandler');


// Import routes
const addExpenseRoutes = require('./app/routes/addExpenseRoutes'); // Ensure this path is correct


connectDB().then(() => {
    // Start your server or continue with your application
  }).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  });

// Middleware
app.use(cors()); 
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Finsy backend!');
});
app.use('/api/expenses', addExpenseRoutes); // Prefix routes for better organization

// Error Handling Middleware (Optional)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
