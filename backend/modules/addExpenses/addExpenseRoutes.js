const express = require('express');
const addExpenseRouter = express.Router();

const addExpenseController = require('./addExpenseController');
addExpenseRouter.post('/addExpense', addExpenseController.addExpense);
module.exports = addExpenseRouter;

// app.post('/api/response', (req, res) => {
//     const responseString = req.body.response;
//     console.log('Received response:', responseString);
//     res.status(200).json({ message: 'Response received successfully!' });
// });