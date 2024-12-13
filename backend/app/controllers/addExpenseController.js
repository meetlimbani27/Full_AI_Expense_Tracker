// app/controllers/addExpenseController.js
let { json } = require('express');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate, PromptTemplate } = require('@langchain/core/prompts');
const Expense = require('../models/Expense');
const logger = require('../../config/config');
const vectorStore = require('../../db/vectorStore');
// const { SystemMessage, HumanMessage } = require('@langchain/core/messages');

const addExpenseController = {};

addExpenseController.addExpense = async (req, res, next) => {
    let message;

    const incomingExpense = req.body;
    console.log("incoming expense",incomingExpense);

    if (!incomingExpense) {
        return res.status(400).json({ error: 'Expense field is not required.' });
    }

    const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3,
        modelName: "gpt-3.5-turbo",
        maxRetries: 5,
        maxConcurrency: 1,
        timeout: 60000, 
    });


    // let message = [
    //     new SystemMessage("Categorize the expense as 'add' or 'retrieve' or 'not an expense': "),
    //     new HumanMessage(expense)
    // ]        // this approach requires more token but the latency is slightly low here
    const systemMessage = `Categorize the expense's intent as either 'adding' or 'retrieving' or 'not an expense' only. Here is the expense statement: "${incomingExpense.expense}"`;

    // Create prompt template for add
    const promptTemplate = new PromptTemplate({
        template: "You are an AI expense analyzer. Analyze expense statements and return a JSON object with these exact 5 fields: -amount: the numeric value of the expense in Indian Rupees (₹). Extract only the number, do not include the ₹ symbol. -category: must be one of ['food','entertainment','personal care']. -subCategory: an array with one or more valid subcategories. -query: exact query the user sent. -response: a brief confirmation of the expense, mentioning the amount with ₹ symbol and being specific about the category. Here is the expense statement: {expense}",
        inputVariables: ["expense"]
    });
    try {
        const resFromModel = await model.invoke(systemMessage);
        const intent = resFromModel.content.trim().toLowerCase();
        logger.info('Calculated intent: ', intent); // Replaced console.log with logger

        switch (intent) {
            case 'adding':
                try {
                    // Create chain
                    const prompt = ChatPromptTemplate.fromTemplate(promptTemplate.template);
                    const chain = prompt.pipe(model);
                    // Invoke chain
                    const response = await chain.invoke({
                        expense: incomingExpense
                    });

                    json = {
                            ...JSON.parse(response.content),
                            createdAt: new Date(),
                            mode: 'chat',
                            userid: '007',
                            intent: intent
                            }
                            logger.info('Generated JSON: ', json); // Replaced console.log with logger

                    // Save expense to Mongo database
                    const newExpense = new Expense(json);
                    await newExpense.save();
                    // Save expense to vector database
                    await vectorStore.addExpense(json); 

                    message = 'Expense added successfully!';
                } catch (error) {
                    logger.error('Error saving expense: ', error);
                    return res.status(500).json({ error: 'Error saving expense.' });
                }
                break;
            case 'retrieving':
                json = {
                    intent: intent,
                    mode: 'chat',
                    userid: 'XXX',
                    createdAt: new Date(),
                }
                message = 'Expense retrieved successfully!';
                break;
            case 'not an expense':
                json = {
                    intent: intent,
                    mode: 'chat',
                    userid: 'XXX',
                    createdAt: new Date(),
                }
                message = 'This is not an expense.';
                break;
            default:
                return res.status(400).json({ error: 'Invalid intent received from model.' });
        }


        logger.info('Action completed successfully.'); // Replaced console.log with logger
        res.status(200).json({ message: message, intent: intent, json: json });
    } catch (error) {
        logger.error('Error processing expense: ', error);
        next(error); // Pass to error handling middleware
    }
};

module.exports = addExpenseController;
