// app/models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true
},
intent : {
  type: String,
  required: true
},
mode: {
  type: String,
  required: true
},
amount: {
    type: Number,
    required: true
},
category: {
    type: String,
    required: true,
},
subCategory: {
  type: Array,
  required: true,
},
query: {
  type: String,
  required: true
},
response: {
  type: String,
  required: true
},
createdAt: {
    type: Date,
    default: Date.now
},
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;