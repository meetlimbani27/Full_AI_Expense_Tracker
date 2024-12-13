// app/chatQuery/aQueryController.js
const chatQueryService = require('../chatQuery/chatQueryService');

const chatQueryController = {};


chatQueryController.incomingChatQuery = async (req, res, next) => {
    console.log('chatQueryController controller hit');

    const incomingQuery = req.body.expense;
    if (!incomingQuery) {
        return res.status(400).json({ error: 'Expense field is not provided.' });
    }

    // sending the expense to the service
    try {
        console.log('sending expense to service');
        const result = await chatQueryService.categorizeQuery(incomingQuery);
        res.status(200).json(result);


    } catch (error) {
        console.error('Error in categorizing query:', error);
        next(error); // Pass to error handling middleware
    }
}

module.exports = chatQueryController;