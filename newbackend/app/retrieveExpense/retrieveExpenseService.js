// app/retrieveExpense/retrieveExpenseService.js
const { OpenAIEmbeddings } = require('@langchain/openai');
const { QdrantVectorStore } = require('@langchain/qdrant');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { ChatOpenAI } = require("@langchain/openai");
const { LLMChain } = require("langchain/chains");
const { ChatPromptTemplate, PromptTemplate } = require('@langchain/core/prompts');
const { query } = require('express');


const queryExpenseService = {};


console.log('vectorStore initialized');
QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME;
VECTOR_SIZE = 3072;

queryExpenseService.queryExpense = async (incomingQuery) => {
  console.log('queryExpenseService hit with query:', incomingQuery, " with collection", process.env.QDRANT_COLLECTION_NAME);

  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-3.5-turbo",
    maxRetries: 5,
    maxConcurrency: 1,
    timeout: 60000,
});
  const embeddings = new OpenAIEmbeddings({
    model : "text-embedding-3-large",
    openAIApiKey: process.env.OPENAI_API_KEY
  });
  console.log('embeddings initialized');
  const qdrantClient = new QdrantClient({
    dimension: VECTOR_SIZE,
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
  });
  const vectorStore = new QdrantVectorStore(qdrantClient, embeddings, {
    client: qdrantClient,
    collectionName: QDRANT_COLLECTION_NAME,
    vectorSize: VECTOR_SIZE
  });
  console.log('qdrantClient initialized');
  const embedding = await embeddings.embedQuery(incomingQuery);
  console.log('embeddings created', embedding);

  const searchResult = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
    vector: embedding,
    limit: 5,
    with_payload: true,
    dimension: 3072
});
    console.log('search result', searchResult);

    const results = searchResult.map((result, index) => ({
        [`expense${index}`]: {
            amount: result.payload.amount,
            category: result.payload.category,
            initialUserQuery: result.payload.query,
            textUsedToCreateEmbedding: result.payload.embedding,
            // subCategory: result.payload.subCategory,
            // date: result.payload.date,
            score: result.score
        }
    }));
  console.log('results', results);


  const PROMPT_TEMPLATE = `You are an assistant which helps user explain about their expenses. You are given a list of expenses fetched from a vectorDB based on user's initial query while adding the expense. You need to analyze the expenses and provide a summary of the expenses in a style that is similar to user's curent query where he/she want's to know how did they spend their money. The reults can be from different categories like food, travel, shopping etc. but make sure you reply in a way that is similar to user's query and don't include the expenses about which the user has not asked. the output should be in friendly tone and in a <p> tag.
  Here is use's current query: {incomingQuery}
   Here is the expenses data: {result}
   `;
  const addPromptTemplate = new PromptTemplate({
    template: PROMPT_TEMPLATE,
    inputVariables: ["result", "incomingQuery"],
  });
  prompt = ChatPromptTemplate.fromTemplate(addPromptTemplate.template);
  console.log("prompt",prompt)

  const chain = prompt.pipe(model);
    console.log('calling model');
    const retrieval = await chain.invoke({ 
      result: results,
      incomingQuery: incomingQuery 
    });
    console.log('retrieval', retrieval.content);

    return retrieval.content;

};

module.exports = queryExpenseService;