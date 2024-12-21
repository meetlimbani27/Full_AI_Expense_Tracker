// app/makeAddJSON/makeAddJSONService.js
let { json } = require('express');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate, PromptTemplate } = require('@langchain/core/prompts');
const Expense = require('../../db/models/addExpense');
const vectorStore = require('../../db/vectorStore');
const addExpenseService = require('../addExpense/addExpenseService');

const makeAddJSONService = {};

const CATEGORIES = [
  {
    "Housing": [
      "Rent",
      "Mortgage Payments",
      "Utility Bills (Electricity, Water, Heating)",
      "Maintenance and Repairs",
      "Property Taxes",
      "Home Decor and Furnishings"
    ]
  },
  {
    "Transportation": [
      "Fuel",
      "Public Transportation Costs",
      "Vehicle Maintenance",
      "Parking Fees",
      "Tolls"
    ]
  },
  {
    "Food": [
      "Groceries",
      "Dining Out",
      "Snacks and Beverages",
      "Takeout and Delivery"
    ]
  },
  {
    "Personal Care": [
      "Gym Memberships",
      "Toiletries",
      "Haircuts and Salon Services",
      "Spa Treatments"
    ]
  },
  {
    "Health and Medical": [
      "Health Care Expenses",
      "Medications"
    ]
  },
  {
    "Entertainment and Leisure": [
      "Movies, Concerts, and Shows",
      "Sports Events and Activities",
      "Hobbies and Crafts",
      "Subscriptions (Streaming Services, Magazines)",
      "Vacations and Travel"
    ]
  },
  {
    "Clothing and Laundry": [
      "Clothing Purchases",
      "Shoes",
      "Accessories",
      "Laundry"
    ]
  },
  {
    "Debt Payments": [
      "Credit Card Payments",
      "Loans (Personal, Student, etc.)",
      "Other Debt Repayments"
    ]
  },
  {
    "Savings and Investments": [
      "Contributions to Savings Accounts",
      "Stocks and Other Investments"
    ]
  },
  {
    "Education": [
      "Tuition Fees",
      "Books and Supplies",
      "Educational Courses and Workshops"
    ]
  },
  {
    "Insurance": [
      "Health Insurance",
      "Homeowners/Renters Insurance",
      "Life Insurance",
      "Auto Insurance"
    ]
  },
  {
    "Taxes and Legal Fees": [
      "Property Taxes",
      "Income Taxes",
      "Legal Fees"
    ]
  },
  {
    "Pet Care": [
      "Pet Food",
      "Veterinary Expenses",
      "Pet Supplies and Services"
    ]
  },
  {
    "Technology and Gadgets": [
      "Electronics Purchases",
      "Software Subscriptions",
      "Tech Accessories"
    ]
  },
  {
    "Gifts and Donations": [
      "Gifts for Others",
      "Charitable Donations"
    ]
  },
  {
    "Miscellaneous": [
      "Unexpected Expenses",
      "Other Expenses Not Categorized Above"
    ]
  }
];


const PROMPT_TEMPLATE = `
You are an AI expense analyzer. Below is a list of categories and their corresponding subcategories:

${CATEGORIES.map(catObj => {
  const [category, subCategories] = Object.entries(catObj)[0];
  return `- **${category}**: ${subCategories.join(', ')}`;
}).join('\n')}

Analyze the following expense statement and return a JSON object with these exact 5 fields:
- amount: the numeric value of the expense in Indian Rupees (₹). Extract only the number, do not include the ₹ symbol.
- category: STRICTLY must be one of [${CATEGORIES.map(catObj => `'${Object.keys(catObj)[0]}'`).join(', ')}].
- subCategory: an array with one or more valid subcategories corresponding to the identified category.
- response: a brief confirmation of the expense(sent to user for confirmation), mentioning the amount with the ₹ symbol and specifying the category.
- description : here add other aspects like emotion and feeling about the expense if there are any by deducing the query else return empty string, .

Here is the expense statement: {expense}
`;

makeAddJSONService.makeAddJSON = async (incomingQuery, mode) => {
  console.log('makeAddJSONService hit with query:', incomingQuery);

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-3.5-turbo",
    maxRetries: 5,
    maxConcurrency: 1,
    timeout: 60000, 
  });

  


  try {

    // Prepare the prompt
    const addPromptTemplate = new PromptTemplate({
      template: PROMPT_TEMPLATE,
      inputVariables: ["expense"],
    });
    // console.log("prompt",addPromptTemplate)
    prompt = ChatPromptTemplate.fromTemplate(addPromptTemplate.template);
    console.log("prompt",prompt)
    

    // Invoke the model
    const chain = prompt.pipe(model);
    console.log('calling model');
    const result = await chain.invoke({ 
      expense: incomingQuery 
    });

     // Parse and construct JSON
    const responseJSON = JSON.parse(result.content);
    json = {
      ...responseJSON,
      query: incomingQuery,
      mode: mode,
      createdAt: new Date(),
    };
    console.log('json created', json)


    // Save the expense and return a response
    const addExpenseResult = await addExpenseService.addExpense(json, incomingQuery);
    return addExpenseResult.response;
    
  } catch (error) {
    console.error('Error in makeAddJSONService:', error);
    throw new Error('Failed to process the expense statement');
  }

};

module.exports = makeAddJSONService;