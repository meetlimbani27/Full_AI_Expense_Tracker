// db/vectorStore.js
const { OpenAIEmbeddings } = require('@langchain/openai');
const { QdrantClient } = require('@qdrant/js-client-rest');
const { QdrantVectorStore } = require('@langchain/qdrant');
const { randomUUID } = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const COLLECTION_NAME = "expense";
const VECTOR_SIZE = 1536;

const embeddings = new OpenAIEmbeddings({
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
  const id = randomUUID();
  console.log('vectorStore hit');

  text = `[${json.category.toUpperCase()}] Expense of ₹${json.amount} for Category: ${json.category} under Subcategories: ${json.subCategory.join(', ')} on ${json.createdAt.toLocaleDateString()}`;

  console.log('text created', text);

  const embedding = await embeddings.embedQuery(text);
  console.log('embeddings created',);

  await qdrantClient.upsert(COLLECTION_NAME,{
    
    wait: true,
    points: [
      {
        id: id,
        vector: embedding,
        payload: json
      }
    ]
  });


}
module.exports = vectorStore;