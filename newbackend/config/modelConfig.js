export const openAIConfig = {
  default: {
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.3,
    modelName: "gpt-3.5-turbo",
    maxRetries: 5,
    maxConcurrency: 1,
    timeout: 60000,
  },
  embedding: {
    model: "text-embedding-3-large",
    openAIApiKey: process.env.OPENAI_API_KEY,
  },
};

export const vectorStoreConfig = {
  dimension: 3072,
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  collectionName: process.env.QDRANT_COLLECTION_NAME,
};
