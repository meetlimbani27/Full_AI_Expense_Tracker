// app/makeAddJSON/makeAddJSONService.js
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { prompts } from "../../prompts/expensePrompts.js";
import { openAIConfig } from "../../config/modelConfig.js";
import addExpenseService from "../addExpense/addExpenseService.js";

const makeAddJSONService = {};

makeAddJSONService.makeAddJSON = async (incomingQuery, mode) => {
  console.log("makeAddJSONService hit with query:", incomingQuery);

  const model = new ChatOpenAI(openAIConfig.default);

  try {
    const addPromptTemplate = new PromptTemplate({
      template: prompts.addExpensePrompt,
      inputVariables: ["expense"],
    });

    const prompt = ChatPromptTemplate.fromTemplate(addPromptTemplate.template);
    const chain = prompt.pipe(model);

    const result = await chain.invoke({
      expense: incomingQuery,
    });

    const responseJSON = JSON.parse(result.content);
    const json = {
      ...responseJSON,
      query: incomingQuery,
      mode: mode,
      createdAt: new Date(),
    };

    const addExpenseResult = await addExpenseService.addExpense(
      json,
      incomingQuery
    );
    return addExpenseResult.response;
  } catch (error) {
    console.error("Error in makeAddJSONService:", error);
    throw new Error("Failed to process the expense statement");
  }
};

export default makeAddJSONService;
