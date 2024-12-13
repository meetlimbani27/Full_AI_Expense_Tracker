const { OpenAIEmbeddings } = require('@langchain/openai');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { QdrantVectorStore } = require('@langchain/community/vectorstores/qdrant'); 
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');
const logger = require('../config/config');

dotenv.config();

const COLLECTION_NAME = "expense";
const VECTOR_SIZE = 1536;


const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// // check if collection exists
// const collections = await client.getCollections();
// const collectionExists = collections.collections.some(
//   collection => collection.name === COLLECTION_NAME
// );

// if (!collectionExists) {
//   await client.createCollection({
//     collectionName: COLLECTION_NAME,
//     vectors: {
//       size: VECTOR_SIZE,
//       distance: 'Cosine',
//     },
//   });
// }

// Initialize vector store with Qdrant
const vectorStore = new QdrantVectorStore(client, embeddings, {
  collectionName: COLLECTION_NAME,
});
logger.info(`Vector store initialized for collection: ${COLLECTION_NAME}`);

vectorStore.addExpense = async(expense) => {
  try {
    if(!vectorStore) {
      logger.error('Vector store not initialized');
      return;
    }

    const id = randomUUID();
    const metadata = {
      userid: expense.userid.toString(),
      intent : expense.intent,
      mode : expense.mode,
      amount: expense.amount,
      category: expense.category,
      subCategory: expense.subCategory,
      query: expense.query,
      response: expense.response,
      createdAt: expense.createdAt.toISOString(),
  };

  //convert to text for embedding
  const text = `[${expense.category.toUpperCase()}] Expense of ₹${expense.amount} for Category: ${expense.category} under Subcategories: ${expense.subCategory.join(', ')} on ${expense.createdAt.toLocaleDateString()}`;

  //creating the embedding
  const embedding = await embeddings.embedQuery(text);
  logger.info('Embedding created successfully');
  //add to vector store
  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points: [
      {
        id,
        payload: metadata,
        vector: embedding,
      },
    ],
  });
  return true;
  logger.info('Expense added to Qdrant successfully');

  } catch (error) {
    logger.error('Error adding expense to Qdrant:', error);
    throw error;
  }
} 

module.exports = vectorStore;