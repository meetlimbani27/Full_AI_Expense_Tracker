const { ChatOpenAI } = require('@langchain/openai');
const addExpenseController = {}

addExpenseController.addExpense = async (req, res) => {
    const expense = req.body.expense;

    const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3,  // Lower temperature for more consistent outputs
        modelName: "gpt-3.5-turbo"
    });
    const systemMessage = "Categorize the expense as add or retrieve: " + expense;

    try {
        const resFromModel = await model.invoke(systemMessage);
        if (resFromModel.content.toLowerCase() === 'add') {
            console.log('add');
        } else {
            console.log('retrieve');
        }
        console.log('done');
        res.status(200).json({ message: 'Expense received successfully!', result: resFromModel.content.toLowerCase() });
    } catch (error) {
        console.error('Error sending response:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = addExpenseController