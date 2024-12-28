// app/addExpense/addExpenseService.js

import Expense from "../../db/models/addExpense.js";
import vectorStore from "../../db/vectorStore.js";

const addExpenseService = {};

addExpenseService.addExpense = async (json, incomingQuery) => {
  console.log("addExpenseService hit");

  try {
    // add expense to mongodb
    const newExpense = new Expense(json);
    await newExpense.save();

    // add expense to vector store
    await vectorStore.addExpense(json, incomingQuery);
    // console.log('newExpense added', newExpense);
    console.log("new Expense added");
    return json;
  } catch (err) {
    console.error("Error saving expense:", err);
    throw err;
  }
};

export default addExpenseService;
