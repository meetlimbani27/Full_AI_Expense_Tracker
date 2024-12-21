import dotenv from 'dotenv';
import readline from 'readline';
import { ChatOpenAI } from '@langchain/openai'; // Updated import
import { initializeAgentExecutor } from 'langchain/agents';
import { Tool } from 'langchain/tools';

// Load environment variables from .env file
dotenv.config();

// In-memory storage for expenses
const expenses = [];

// Tool: Add Expense
const addExpense = async (expenseData) => {
  try {
    const { amount, category, description } = JSON.parse(expenseData);
    if (!amount || !category) {
      return 'Error: "amount" and "category" fields are required.';
    }
    const newExpense = {
      id: expenses.length + 1,
      amount,
      category,
      description: description || '',
      date: new Date().toISOString(),
    };
    expenses.push(newExpense);
    return `✅ Expense added successfully:\n${JSON.stringify(newExpense, null, 2)}`;
  } catch (error) {
    return '❌ Failed to add expense. Please ensure the input is a valid JSON string with "amount" and "category".';
  }
};

// Tool: Retrieve Expenses
const retrieveExpenses = async (query) => {
  try {
    if (query.toLowerCase().includes('all')) {
      if (expenses.length === 0) {
        return '📂 No expenses recorded yet.';
      }
      return `📂 **All Expenses:**\n${JSON.stringify(expenses, null, 2)}`;
    } else {
      const keywords = query.toLowerCase().split(' ');
      const filteredExpenses = expenses.filter(expense =>
        keywords.every(keyword =>
          expense.category.toLowerCase().includes(keyword) ||
          expense.description.toLowerCase().includes(keyword)
        )
      );
      if (filteredExpenses.length === 0) {
        return '📂 No matching expenses found.';
      }
      return `📂 **Filtered Expenses:**\n${JSON.stringify(filteredExpenses, null, 2)}`;
    }
  } catch (error) {
    return '❌ Failed to retrieve expenses. Please try again.';
  }
};

// Tool: Handle General Questions
const handleGeneralQuestion = async (question) => {
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.7,
  });

  try {
    const response = await llm.call({ prompt: question });
    return response.text;
  } catch (error) {
    return '❌ Sorry, I encountered an error while processing your request.';
  }
};

// Define Tools
const addExpenseTool = new Tool({
  name: 'AddExpense',
  description: 'Use this tool to add a new expense. Provide a JSON string with "amount", "category", and optional "description". Example: {"amount": 50, "category": "groceries", "description": "weekly shopping"}',
  func: addExpense,
});

const retrieveExpensesTool = new Tool({
  name: 'RetrieveExpenses',
  description: 'Use this tool to retrieve expense data. You can ask for all expenses or specify criteria. Example queries: "Show me all expenses", "Show me expenses for groceries"',
  func: retrieveExpenses,
});

const generalQuestionTool = new Tool({
  name: 'GeneralQuestion',
  description: 'Use this tool to handle general questions that are not related to expenses.',
  func: handleGeneralQuestion,
});


const tools = [addExpenseTool, retrieveExpensesTool, generalQuestionTool];
// Initialize LLM
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});

// Initialize Agent Executor with Tools
const executor = await initializeAgentExecutor(tools, llm);

// Setup Readline Interface for CLI Interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'You: ',
});

console.log('👋 Welcome to the Expense Manager Chatbot!');
console.log('Type "exit" to quit.\n');

 rl.prompt();

 rl.on('line', async (line) => {
   const userInput = line.trim();
   if (userInput.toLowerCase() === 'exit') {
     rl.close();
     return;
   }

   try {
     const response = await executor.call({ input: userInput });
     console.log(`🤖 Bot: ${response.output.trim()}\n`);
   } catch (error) {
     console.error('❌ Error:', error);
   }

   rl.prompt();
 }).on('close', () => {
   console.log('\n👋 Goodbye!');
   process.exit(0);
 });
