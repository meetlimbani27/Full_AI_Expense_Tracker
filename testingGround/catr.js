// const {
//   ChatPromptTemplate,
//   PromptTemplate,
// } = require("@langchain/core/prompts");
// const { ChatOpenAI } = require("@langchain/openai");
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";

const CATEGORIES = [
  {
    Housing: [
      "Rent",
      "Mortgage Payments",
      "Utility Bills (Electricity, Water, Heating)",
      "Maintenance and Repairs",
      "Property Taxes",
      "Home Decor and Furnishings",
    ],
  },
  {
    Transportation: [
      "Fuel",
      "Public Transportation Costs",
      "Vehicle Maintenance",
      "Parking Fees",
      "Tolls",
    ],
  },
  {
    Food: [
      "Groceries",
      "Dining Out",
      "Snacks and Beverages",
      "Takeout and Delivery",
    ],
  },
  {
    "Personal Care": [
      "Gym Memberships",
      "Toiletries",
      "Haircuts and Salon Services",
      "Spa Treatments",
    ],
  },
  {
    "Health and Medical": ["Health Care Expenses", "Medications"],
  },
  {
    "Entertainment and Leisure": [
      "Movies, Concerts, and Shows",
      "Sports Events and Activities",
      "Hobbies and Crafts",
      "Subscriptions (Streaming Services, Magazines)",
      "Vacations and Travel",
    ],
  },
  {
    "Clothing and Laundry": [
      "Clothing Purchases",
      "Shoes",
      "Accessories",
      "Laundry",
    ],
  },
  {
    "Debt Payments": [
      "Credit Card Payments",
      "Loans (Personal, Student, etc.)",
      "Other Debt Repayments",
    ],
  },
  {
    "Savings and Investments": [
      "Contributions to Savings Accounts",
      "Stocks and Other Investments",
    ],
  },
  {
    Education: [
      "Tuition Fees",
      "Books and Supplies",
      "Educational Courses and Workshops",
    ],
  },
  {
    Insurance: [
      "Health Insurance",
      "Homeowners/Renters Insurance",
      "Life Insurance",
      "Auto Insurance",
    ],
  },
  {
    "Taxes and Legal Fees": ["Property Taxes", "Income Taxes", "Legal Fees"],
  },
  {
    "Pet Care": [
      "Pet Food",
      "Veterinary Expenses",
      "Pet Supplies and Services",
    ],
  },
  {
    "Technology and Gadgets": [
      "Electronics Purchases",
      "Software Subscriptions",
      "Tech Accessories",
    ],
  },
  {
    "Gifts and Donations": ["Gifts for Others", "Charitable Donations"],
  },
  {
    Miscellaneous: [
      "Unexpected Expenses",
      "Other Expenses Not Categorized Above",
    ],
  },
];

const PROMPT_TEMPLATE = `
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
`;
let OPENAI_API_KEY =
  "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";

let QDRANT_COLLECTION_NAME = "tencat";
let VECTOR_SIZE = 3072;
let QDRANT_URL =
  "https://c19f3a5e-e9e7-4140-a336-5b00a8e08657.europe-west3-0.gcp.cloud.qdrant.io:6333";
let QDRANT_API_KEY = "fU5GcSTjHXa1uKH3nogy9Lvx6zlppL3Y5kZX06ub5y8qWeftKsXIvQ";

const qdrantClient = new QdrantClient({
  dimension: VECTOR_SIZE,
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

const model = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  temperature: 0.3,
  modelName: "gpt-3.5-turbo",
  maxRetries: 5,
  maxConcurrency: 1,
  timeout: 60000,
});

const main = async () => {
  //   const retrievePromptTemplate = new PromptTemplate({
  //     template: PROMPT_TEMPLATE,
  //     inputVariables: ["query"],
  //   });

  //   let prompt = ChatPromptTemplate.fromTemplate(retrievePromptTemplate.template);

  //   const chain = prompt.pipe(model);
  //   console.log("calling model");
  //   const result = await chain.invoke({
  //     query: "how much did i spend on groceries last month",
  //   });
  //   console.log("result", result.content);
  let results = await qdrantClient.scroll(QDRANT_COLLECTION_NAME, {
    filter: {
      must: [
        {
          key: "category",
          match: { value: "Food" },
        },
      ],
    },
  });
  console.log("results", JSON.stringify(results, null, 2));
};

main();
