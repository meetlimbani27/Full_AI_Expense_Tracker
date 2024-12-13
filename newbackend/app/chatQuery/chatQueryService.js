// app/chatQuery/chatQueryService.js
const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate, PromptTemplate } = require('@langchain/core/prompts');
// const Expense = require('../../db/models/addExpense');

const expenseService = {};

expenseService.categorizeQuery = async (incomingQuery) => {
  console.log('categorizeQuery service hit')

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-3.5-turbo",
    maxRetries: 5,
    maxConcurrency: 1,
    timeout: 60000, 
});

const systemPrompt = `Categorize the expense's intent as either 'adding' or 'querying' or 'not an expense' only. Here is the expense statement: "${incomingQuery}"`;

try {
  const result = await model.invoke(systemPrompt);
  console.log("intent identified", result.content);
} catch (error) {
  console.log('error in categorizing query',error)
}
}
module.exports = expenseService;