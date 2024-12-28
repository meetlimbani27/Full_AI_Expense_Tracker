// app/retrieveExpense/retrieveExpenseService.js
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { ChatOpenAI } from "@langchain/openai";
import { LLMChain } from "langchain/chains";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { prompts } from "../../prompts/expensePrompts.js";
import { openAIConfig, vectorStoreConfig } from "../../config/modelConfig.js";

const queryExpenseService = {};

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

console.log("vectorStore initialized");
const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME;
const VECTOR_SIZE = 3072;

queryExpenseService.queryExpense = async (incomingQuery) => {
  console.log(
    "queryExpenseService hit with query:",
    incomingQuery,
    " with collection",
    process.env.QDRANT_COLLECTION_NAME
  );

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-3.5-turbo",
    maxRetries: 5,
    maxConcurrency: 1,
    timeout: 60000,
  });
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  console.log("embeddings initialized");
  const qdrantClient = new QdrantClient({
    dimension: VECTOR_SIZE,
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });
  const vectorStore = new QdrantVectorStore(qdrantClient, embeddings, {
    client: qdrantClient,
    collectionName: QDRANT_COLLECTION_NAME,
    vectorSize: VECTOR_SIZE,
  });
  console.log("qdrantClient initialized");
  const embedding = await embeddings.embedQuery(incomingQuery);
  console.log("embeddings created", embedding);

  const searchResult = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
    vector: embedding,
    limit: 5,
    with_payload: true,
    dimension: 3072,
  });
  console.log("search result", searchResult);

  const results = searchResult.map((result, index) => ({
    [`expense${index}`]: {
      amount: result.payload.amount,
      category: result.payload.category,
      initialUserQuery: result.payload.query,
      textUsedToCreateEmbedding: result.payload.embedding,
      // subCategory: result.payload.subCategory,
      // date: result.payload.date,
      score: result.score,
    },
  }));
  console.log("results", results);

  const PROMPT_TEMPLATE = `You are an assistant which helps user explain about their expenses. You are given a list of expenses fetched from a vectorDB based on user's initial query while adding the expense. You need to analyze the expenses and provide a summary of the expenses in a style that is similar to user's curent query where he/she want's to know how did they spend their money. The reults can be from different categories like food, travel, shopping etc. but make sure you reply in a way that is similar to user's query and don't include the expenses about which the user has not asked. the output should be in friendly tone and in a <p> tag.
  Here is use's current query: {incomingQuery}
   Here is the expenses data: {result}
   `;
  const addPromptTemplate = new PromptTemplate({
    template: PROMPT_TEMPLATE,
    inputVariables: ["result", "incomingQuery"],
  });
  prompt = ChatPromptTemplate.fromTemplate(addPromptTemplate.template);
  console.log("prompt", prompt);

  const chain = prompt.pipe(model);
  console.log("calling model");
  const retrieval = await chain.invoke({
    result: results,
    incomingQuery: incomingQuery,
  });
  console.log("retrieval", retrieval.content);

  return retrieval.content;
};

export default queryExpenseService;
