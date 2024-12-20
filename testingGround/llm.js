// llm.js
import { OpenAI } from "langchain/llms/openai.js";
import dotenv from "dotenv";

dotenv.config();

const llm = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0, // Set to 0 for deterministic responses
});

export default llm;
