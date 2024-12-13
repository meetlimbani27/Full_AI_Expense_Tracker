// app/aQuery/aQueryController.js
const aQueryService = require('../aQuery/aQueryService');

const aQueryController = {};


aQueryController.incomingAQuery = async (req, res, next) => {
    console.log('aQueryController controller hit');

    const incomingQuery = req.body.expense;
    if (!incomingQuery) {
        return res.status(400).json({ error: 'Expense field is not provided.' });
    }

    // sending the expense to the service
    try {
        console.log('sending expense to service');
        const result = await aQueryService.categorizeQuery(incomingQuery);
        res.status(200).json(result);


    } catch (error) {
        console.error('Error in categorizing query:', error);
        next(error); // Pass to error handling middleware
    }
}

module.exports = aQueryController;