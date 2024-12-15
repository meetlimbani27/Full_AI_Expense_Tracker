// app/addExpense/addExpenseService.js
const Expense = require('../../db/models/addExpense');
const vectorStore = require('../../db/vectorStore');

const addExpenseService = {};

  addExpenseService.addExpense = async (json) => {
  console.log('addExpenseService hit');

  try {
    // add expense to mongodb
    const newExpense = new Expense(json);
    await newExpense.save();

    // add expense to vector store
    await vectorStore.addExpense(json);
    // console.log('newExpense added', newExpense);
    console.log('new Expense added');
    return json;
  } catch (err) {
    console.error('Error saving expense:', err);
    throw err;
  }
 
};

module.exports = addExpenseService;