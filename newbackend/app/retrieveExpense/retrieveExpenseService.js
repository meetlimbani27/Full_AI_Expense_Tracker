// app/retrieveExpense/retrieveExpenseService.js
const { OpenAIEmbeddings } = require('@langchain/openai');
// const { QdrantVectorStore } = require('@langchain/qdrant');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { ChatOpenAI } = require("@langchain/openai");
const { LLMChain } = require("langchain/chains");




const queryExpenseService = {};



// const vectorStore = new QdrantVectorStore(qdrantClient, embeddings, {
//   client: qdrantClient,
//   collectionName: COLLECTION_NAME,
//   vectorSize: VECTOR_SIZE
// });
console.log('vectorStore initialized');



queryExpenseService.queryExpense = async (incomingQuery) => {
  const model = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-3.5-turbo",
    maxRetries: 5,
    maxConcurrency: 1,
    timeout: 60000,
});

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
  });
  console.log('embeddings initialized');
  const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
  });
  console.log('qdrantClient initialized');
  const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME;
  const VECTOR_SIZE = 1536;
  
  

  console.log('queryExpenseService hit with query:', incomingQuery);
  const embedding = await embeddings.embedQuery(incomingQuery);
  console.log('embeddings created', embedding);

  const searchResult = await qdrantClient.search(COLLECTION_NAME, {
    vector: embedding,
    limit: 5,
    with_payload: true
});
    // console.log('search result', searchResult);

    const results = searchResult.map(result => ({
      pageContent: result.payload.content,
      metadata: {
          id: result.payload.mongoId,
          amount: result.payload.amount,
          category: result.payload.category,
          subCategory: result.payload.subCategory,
          date: result.payload.date,
          score: result.score
      }
  }));
  const expensesText = results.map(r => r.pageContent).join('\n');

  function createTracedChain(chain, name) {
    chain.tags = [`expense_tracker_${name}`];
    return {
        call: async (params) => withRetry(() => chain.call(params))
    };
}


  const retrievalChain = createTracedChain(
    new LLMChain({
        llm: model,
        prompt: retrievalPrompt
    }),
    "retrieval_analysis"
  );
  
  const analysis = await retrievalChain.call({
    query: input,
    expenses: expensesText
});

const retrievalPrompt = ChatPromptTemplate.fromMessages([
  ["system", `You are an AI assistant that helps analyze and summarize expense information.
Given a user's query and a list of relevant expenses, provide a clear and helpful response.

Guidelines:
1. Calculate total amounts when relevant
2. Group expenses by category if mentioned
3. Highlight patterns or unusual expenses
4. Keep the response concise but informative
5. Use Indian Rupee (₹) for all amounts

Example Query: "show my food expenses"
Example Expenses: 
- ₹500 for lunch at restaurant (Food)
- ₹200 for snacks (Food)
- ₹1000 for groceries (Food)

Example Response:
"I found 3 food-related expenses totaling ₹1,700. This includes ₹500 for lunch, ₹200 for snacks, and ₹1,000 for groceries."
`],
  ["human", "Query: {query}\nExpenses:\n{expenses}"]
]);


console.log('\n📊 ' + analysis.text);

};

module.exports = queryExpenseService;