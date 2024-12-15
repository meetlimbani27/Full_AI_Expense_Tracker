// app/makeJSON/notJSONService.js
const { ChatOpenAI } = require('@langchain/openai');


const notJSONService = {};

notJSONService.notJSON = async (incomingQuery) => {
    console.log('notJSONService hit')

    const model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3,
        modelName: "gpt-3.5-turbo",
        maxRetries: 5,
        maxConcurrency: 1,
        timeout: 60000, 
      });

      const systemPrompt = `you are an expense tracker app which helps user add expenses and retrieve it using natural language so answer any general question based on this context only. Here is the user's query: "${incomingQuery}"`;
    
    const result = await model.invoke(systemPrompt)
    console.log(result.content)
    return result.content;
}


module.exports = notJSONService;