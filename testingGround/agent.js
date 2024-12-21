// agent.js
import { initializeAgentExecutor } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai.js";
import { Tool } from "langchain/tools.js";
import { addExpense, retrieveExpenses, handleGeneralQuestion } from "./tools.js";

const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});

const addExpenseTool = new Tool({
  name: "AddExpense",
  description:
    "Use this tool to add a new expense. Input should be a JSON string with amount, category, and description.",
  func: addExpense,
});

const retrieveExpensesTool = new Tool({
  name: "RetrieveExpenses",
  description:
    "Use this tool to retrieve expense data. You can ask for all expenses or specify criteria.",
  func: retrieveExpenses,
});

const generalQuestionTool = new Tool({
  name: "GeneralQuestion",
  description:
    "Use this tool to handle general questions that are not related to expenses.",
  func: handleGeneralQuestion,
});

const tools = [addExpenseTool, retrieveExpensesTool, generalQuestionTool];

const executor = await initializeAgentExecutor(tools, llm, { agentType: "zero-shot-react-description" });

export default executor;
