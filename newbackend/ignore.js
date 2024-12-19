// expenseTracker.js

// Import Required Modules
const { Configuration, OpenAIApi } = require("openai"); // For CommonJS
const winston = require("winston");
require("dotenv").config(); // Ensure you have a .env file with OPENAI_API_KEY

// ----------------------------
// Mock Service Implementations
// ----------------------------

/**
 * Mock service to add an expense.
 * In a real-world scenario, this would interact with a database or another backend service.
 */
const makeAddJSONService = {
  makeAddJSON: async (expense, mode) => {
    // Mock processing
    console.log(`Adding expense: ${expense} with mode: ${mode}`);
    // Return a mock JSON response
    return {
      success: true,
      message: `Expense "${expense}" added successfully with mode "${mode}".`,
      expenseId: Date.now(),
    };
  },
};

/**
 * Mock service to query expenses.
 * In a real-world scenario, this would retrieve data from a database.
 */
const queryExpenseService = {
  handleQuery: async (query) => {
    // Mock processing
    console.log(`Querying expenses with query: ${query}`);
    // Return a mock query result
    return {
      success: true,
      data: [
        {
          expenseId: 1,
          amount: 500,
          category: "Food",
          subCategory: ["Groceries"],
          description: "Bought groceries from the supermarket.",
          createdAt: "2023-10-01T10:00:00Z",
        },
        // Add more mock expenses as needed
      ],
    };
  },
};

/**
 * Mock service to handle general (non-expense) queries.
 * In a real-world scenario, this might interface with a different system or provide general information.
 */
const notJSONService = {
  notJSON: async (query) => {
    // Mock processing
    console.log(`Handling general query: ${query}`);
    // Return a mock response
    return {
      success: true,
      response: `You asked: "${query}". Here's some general information.`,
    };
  },
};

// ----------------------------
// Logger Configuration
// ----------------------------

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ""
        }`
    )
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// If not in production, also log to the console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// ----------------------------
// OpenAI Configuration
// ----------------------------

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env file
// });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAIApi({
  api_key: process.env.OPENAI_API_KEY
});

// ----------------------------
// Function Definitions
// ----------------------------

/**
 * Adds a new expense based on the provided statement.
 * @param {string} expense - The expense statement to add.
 * @param {string} mode - The mode of adding expense.
 * @returns {object} - Result of adding the expense.
 */
const addExpense = async (expense, mode) => {
  try {
    const addResult = await makeAddJSONService.makeAddJSON(expense, mode);
    return addResult;
  } catch (error) {
    logger.error("Error in addExpense:", { error: error.message });
    throw new Error("Failed to add expense.");
  }
};

/**
 * Queries information about expenses.
 * @param {string} query - The query statement about expenses.
 * @returns {object} - Result of the expense query.
 */
const queryExpense = async (query) => {
  try {
    const queryResult = await queryExpenseService.handleQuery(query);
    return queryResult;
  } catch (error) {
    logger.error("Error in queryExpense:", { error: error.message });
    throw new Error("Failed to query expenses.");
  }
};

/**
 * Handles general queries not related to expenses.
 * @param {string} query - The general query statement.
 * @returns {object} - Result of handling the general query.
 */
const generalQuery = async (query) => {
  try {
    const generalResult = await notJSONService.notJSON(query);
    return generalResult;
  } catch (error) {
    logger.error("Error in generalQuery:", { error: error.message });
    throw new Error("Failed to handle the general query.");
  }
};

// ----------------------------
// Function Dispatcher
// ----------------------------

/**
 * Maps function names to their implementations and dispatches the appropriate function.
 */
const functionMap = {
  addExpense: addExpense,
  queryExpense: queryExpense,
  generalQuery: generalQuery,
};

/**
 * Dispatches the function based on the function name provided by the LLM.
 * @param {string} functionName - Name of the function to call.
 * @param {object} args - Arguments for the function.
 * @returns {object} - Result from the dispatched function.
 */
const dispatchFunction = async (functionName, args) => {
  const func = functionMap[functionName];
  if (!func) {
    throw new Error(`Function "${functionName}" is not defined.`);
  }
  // Ensure that args are passed in the correct order
  return await func(...Object.values(args));
};

// ----------------------------
// Function Definitions for OpenAI
// ----------------------------

const functionsDefinition = [
  {
    name: "addExpense",
    description: "Add a new expense based on the provided statement.",
    parameters: {
      type: "object",
      properties: {
        expense: {
          type: "string",
          description: "The expense statement to add.",
        },
        mode: {
          type: "string",
          description: "Mode of adding expense (e.g., 'default', 'manual').",
        },
      },
      required: ["expense", "mode"],
    },
  },
  {
    name: "queryExpense",
    description: "Query information about expenses.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The query statement about expenses.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "generalQuery",
    description: "Handle general queries not related to expenses.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The general query statement.",
        },
      },
      required: ["query"],
    },
  },
];

// ----------------------------
// Main Handler Function
// ----------------------------

/**
 * Handles the user's query by interacting with OpenAI's API and dispatching the appropriate function.
 * @param {string} incomingQuery - The user's input query.
 * @param {string} mode - The mode of operation (can be used to alter behavior).
 * @returns {object} - The response and intent.
 */
const handleUserQuery = async (incomingQuery, mode) => {
  logger.info("Received user query", { incomingQuery, mode });

  const systemPrompt = `You are an expense tracker app that helps users add expenses and retrieve them using natural language. Categorize the user's query into one of the following intents: 'addExpense', 'queryExpense', or 'generalQuery'. Then, call the appropriate function to handle the request.`;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4-0613", // Ensure the model supports function calling
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: incomingQuery },
      ],
      functions: functionsDefinition,
      function_call: "auto", // Let the model decide which function to call
    });

    const message = response.data.choices[0].message;

    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);

      logger.info("Function to be called", { functionName, functionArgs });

      const result = await dispatchFunction(functionName, functionArgs);

      logger.info("Function executed successfully", { result });

      return {
        response: result,
        intent: functionName,
      };
    } else {
      logger.warn("No function was called by the model");
      return {
        response: "I'm not sure how to help with that.",
        intent: "unknown",
      };
    }
  } catch (error) {
    logger.error("Error handling user query", { error: error.message });
    return {
      response:
        "There was an error processing your request. Please try again later.",
      intent: "error",
    };
  }
};

// ----------------------------
// Example Usage
// ----------------------------

(async () => {
  const incomingQuery = "I spent ₹500 on groceries today.";
  const mode = "default";

  const result = await handleUserQuery(incomingQuery, mode);
  console.log("Result:", result);
})();
