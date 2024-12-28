export const CATEGORIES = [
  {
    Housing: [
      "Rent",
      "Mortgage Payments",
      "Utility Bills (Electricity, Water, Heating)",
      // ... rest of categories
    ],
  },
  // ... rest of the category objects
];

export const prompts = {
  addExpensePrompt: `
You are an AI expense analyzer. Below is a list of categories and their corresponding subcategories:

${CATEGORIES.map((catObj) => {
  const [category, subCategories] = Object.entries(catObj)[0];
  return `- **${category}**: ${subCategories.join(", ")}`;
}).join("\n")}

Analyze the following expense statement and return a JSON object with these exact 5 fields:
- amount: the numeric value of the expense in Indian Rupees (₹). Extract only the number, do not include the ₹ symbol.
- category: STRICTLY must be one of [${CATEGORIES.map(
    (catObj) => `'${Object.keys(catObj)[0]}'`
  ).join(", ")}].
- subCategory: an array with one or more valid subcategories corresponding to the identified category.
- response: a brief confirmation of the expense(sent to user for confirmation), mentioning the amount with the ₹ symbol and specifying the category.
- description : here add other aspects like emotion and feeling about the expense if there are any by deducing the query else return empty string, .

Here is the expense statement: {expense}
`,

  retrieveExpensePrompt: `
You are an expert query analyzer. Below is a list of categories and their corresponding subcategories:

${CATEGORIES.map((catObj) => {
  const [category, subCategories] = Object.entries(catObj)[0];
  return `- **${category}**: ${subCategories.join(", ")}`;
}).join("\n")}

current Date and Time is : ${new Date()}

Analyze the following user's retrieving query and return a JSON object with these exact 5 fields:
- category: STRICTLY must be one of [${CATEGORIES.map(
    (catObj) => `'${Object.keys(catObj)[0]}'`
  ).join(", ")}].
- startDate: if the query has a date range then this field will have the starting date and time in this format 2024-12-28T09:35:17.933Z.
- EndDate: if the query has a date range then this field will have the ending date and time in this format 2024-12-28T09:35:17.933Z
- subCategory: an array with one or more valid subcategories corresponding to the identified category.

Here is the user's query: {query}
`,

  summarizeExpensePrompt: `You are an assistant which helps user explain about their expenses. You are given a list of expenses fetched from a vectorDB based on user's initial query while adding the expense. You need to analyze the expenses and provide a summary of the expenses in a style that is similar to user's curent query where he/she want's to know how did they spend their money. The reults can be from different categories like food, travel, shopping etc. but make sure you reply in a way that is similar to user's query and don't include the expenses about which the user has not asked. the output should be in friendly tone and in a <p> tag.
Here is use's current query: {incomingQuery}
Here is the expenses data: {result}
`,

  intentClassificationPrompt: `Categorize the expense's intent as either 'adding'(for adding expense) or 'querying'(for querying about expense) or 'not an expense'(for general questions) only. Here is the expense statement: "{query}"`,
};
