// app/addExpense/addExpenseService.js
let { json } = require('express');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate, PromptTemplate } = require('@langchain/core/prompts');
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
    console.log('newExpense added', newExpense);
  } catch (err) {
    console.error('Error saving expense:', err);
    throw err;
  }


  try {
    
    
  } catch (error) {
    
  }




  console.log('addExpenseService hit with', incomingQuery);
};

module.exports = addExpenseService;