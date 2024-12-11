// app/routes/addExpenseRoutes.js
const express = require('express');
const addExpenseRouter = express.Router();

const addExpenseController = require('../controllers/addExpenseController'); // Corrected path

// Define routes
addExpenseRouter.post('/add', addExpenseController.addExpense);
// Future routes can be added here, e.g., addExpenseRouter.get('/retrieve', ...);

module.exports = addExpenseRouter;
