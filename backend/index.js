// index.js
'use strict';

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 8000;

// Import routes
const addExpenseRoutes = require('./app/routes/addExpenseRoutes'); // Ensure this path is correct

// Middleware
app.use(cors()); 
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Finsy backend!');
});
app.use('/api/expenses', addExpenseRoutes); // Prefix routes for better organization

// Error Handling Middleware (Optional)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
