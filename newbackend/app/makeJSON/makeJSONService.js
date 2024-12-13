// app/makeJSON/makeJSONService.js
let { json } = require('express');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate, PromptTemplate } = require('@langchain/core/prompts');
const Expense = require('../../db/models/addExpense');
const vectorStore = require('../../db/vectorStore');
const addExpenseService = require('../addExpense/addExpenseService');

const makeJSONService = {};

makeJSONService.makeJSON = async (incomingQuery, mode) => {
  console.log('makeJSONService hit with query:', incomingQuery);

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-3.5-turbo",
    maxRetries: 5,
    maxConcurrency: 1,
    timeout: 60000, 
  });

  const addPromptTemplate = new PromptTemplate({
    template: "You are an AI expense analyzer. Analyze expense statements and return a JSON object with these exact 4 fields: -amount: the numeric value of the expense in Indian Rupees (₹). Extract only the number, do not include the ₹ symbol. -category: must be one of ['food','entertainment','personal care']. -subCategory: an array with one or more valid subcategories. -response: a brief confirmation of the expense, mentioning the amount with ₹ symbol and being specific about the category. Here is the expense statement: {expense}",
    inputVariables: ["expense"],
  });

  try {
    prompt = ChatPromptTemplate.fromTemplate(addPromptTemplate.template);
    const chain = prompt.pipe(model);
    console.log('calling model');
    const result = await chain.invoke({ 
      expense: incomingQuery 
    });
    json = {
      ...JSON.parse(result.content),
      query: incomingQuery,
      mode: mode,
      createdAt: new Date(),
    };
    console.log('json created')
    const addExpenseResult = await addExpenseService.addExpense(json);
    console.log('addExpenseResult', addExpenseResult);

    console.log('json', json);
    
  } catch (error) {
    
  }




};

module.exports = makeJSONService;