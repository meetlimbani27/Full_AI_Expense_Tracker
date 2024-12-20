// tools.js
let expenses = [];

export const addExpense = async (expenseData) => {
  const { amount, category, description } = JSON.parse(expenseData);
  const newExpense = {
    id: expenses.length + 1,
    amount,
    category,
    description,
    date: new Date(),
  };
  expenses.push(newExpense);
  return `Expense added successfully: ${JSON.stringify(newExpense)}`;
};

export const retrieveExpenses = async (query) => {
  // Simple retrieval; enhance with query parsing as needed
  if (query.toLowerCase().includes("all")) {
    return JSON.stringify(expenses);
  } else {
    return "Please specify your query more clearly.";
  }
};

export const handleGeneralQuestion = async (question) => {
  // Utilize the LLM directly for general questions
  // This function can be enhanced or replaced as needed
  return `I can help you with expenses. Please ask about adding or retrieving expenses.`;
};
