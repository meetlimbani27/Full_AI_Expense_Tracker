// db/vectorStore.js
const { OpenAIEmbeddings } = require('@langchain/openai');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { QdrantVectorStore } = require('@langchain/qdrant');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME;
const VECTOR_SIZE = 3072;


const embeddings = new OpenAIEmbeddings({
  model : "text-embedding-3-large",
  openAIApiKey: process.env.OPENAI_API_KEY
});
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

const vectorStore = new QdrantVectorStore(qdrantClient, embeddings, {
  client: qdrantClient,
  collectionName: COLLECTION_NAME,
  vectorSize: VECTOR_SIZE
});
console.log('vectorStore initialized');

vectorStore.addExpense = async(json) => {
  console.log(COLLECTION_NAME);
  const collections = await qdrantClient.getCollections();
  const collectionExists = collections.collections.some(
      collection => collection.name === COLLECTION_NAME
  );

  if (!collectionExists) {
      // Create new collection with proper configuration
      await qdrantClient.createCollection(COLLECTION_NAME, {
          vectors: {
              size: VECTOR_SIZE,
              distance: "Cosine"
          }
      });

      console.log("✅ Created new Qdrant collection");
  }
  
  const id = randomUUID();
  console.log('vectorStore hit');

  const embedding_text = `Category: ${json.category.toUpperCase()}. Subcategories: ${json.subCategory.join(', ')}. Amount: ₹${json.amount}. Purpose: ${json.description || 'General Expense'}. Date: ${json.createdAt.toISOString()}.`;


  const test_text = `[${json.category.toUpperCase()}]`;

  const embedding = await embeddings.embedQuery(embedding_text);
  console.log('embeddings created',);

  const payload = {
    amount: json.amount,
    category: json.category,
    embedding: embedding_text,
    // subCategory: json.subCategory,
    // createdAt: json.createdAt.toISOString(), // ISO format for consistency
  };

  console.log('text created', test_text);

  

  await qdrantClient.upsert(COLLECTION_NAME,{
    
    wait: true,
    points: [
      {
        id: id,
        vector: embedding,
        payload: payload
      }
    ]
  });


}
module.exports = vectorStore;