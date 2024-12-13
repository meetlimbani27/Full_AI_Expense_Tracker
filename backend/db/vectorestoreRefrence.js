// Import required dependencies for vector storage and embeddings
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables for API keys
dotenv.config();

// Qdrant collection configuration
const COLLECTION_NAME = "expenses";
const VECTOR_SIZE = 1536; // OpenAI embeddings dimension

/**
 * VectorStoreService class
 * Handles the storage and retrieval of expense embeddings for semantic search using Qdrant Cloud
 */
class VectorStoreService {
    constructor() {
        // Ensure required environment variables are available
        const requiredEnvVars = ['OPENAI_API_KEY', 'QDRANT_URL', 'QDRANT_API_KEY'];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new Error(`${envVar} is required in .env file`);
            }
        }

        // Initialize OpenAI embeddings with API key
        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        // Initialize Qdrant client with cloud configuration
        this.client = new QdrantClient({
            url: process.env.QDRANT_URL,
            apiKey: process.env.QDRANT_API_KEY
        });

        this.vectorStore = null;
    }

    /**
     * Initialize the vector store
     * Creates Qdrant collection if it doesn't exist
     */
    async init() {
        try {
            // Check if collection exists
            const collections = await this.client.getCollections();
            const collectionExists = collections.collections.some(
                collection => collection.name === COLLECTION_NAME
            );

            if (!collectionExists) {
                // Create new collection with proper configuration
                await this.client.createCollection(COLLECTION_NAME, {
                    vectors: {
                        size: VECTOR_SIZE,
                        distance: "Cosine"
                    }
                });

                console.log("✅ Created new Qdrant collection");
            }

            // Initialize vector store with Qdrant
            this.vectorStore = new QdrantVectorStore(this.client, this.embeddings, {
                collectionName: COLLECTION_NAME,
            });

            console.log("✅ Connected to Qdrant Cloud");
        } catch (error) {
            console.error("Error initializing Qdrant store:", error);
            throw error;
        }
    }

    /**
     * Add a new expense to the vector store
     * @param {Object} expense - The expense object to add
     * @param {string} expense._id - MongoDB document ID
     * @param {number} expense.amount - Expense amount
     * @param {string} expense.category - Expense category
     * @param {Array<string>} expense.subCategory - Subcategories
     * @param {Date} expense.createdAt - Creation timestamp
     * @returns {Promise<boolean>} Success indicator
     */
    async addExpense(expense) {
        try {
            if (!this.vectorStore) {
                await this.init();
            }

            // Create metadata for the expense
            const metadata = {
                id: expense._id.toString(),
                amount: expense.amount,
                category: expense.category,
                subCategory: expense.subCategory,
                date: expense.createdAt.toISOString()
            };

            // Create a rich text representation of the expense
            const textContent = `[${expense.category.toUpperCase()}] Expense of ₹${expense.amount} for ${expense.response} 
            (Category: ${expense.category}, Subcategories: ${expense.subCategory.join(', ')}) 
            on ${expense.createdAt.toLocaleDateString()}`;

            // Create embeddings and add to Qdrant
            const embedding = await this.embeddings.embedQuery(textContent);
            await this.client.upsert(COLLECTION_NAME, {
                wait: true,
                points: [{
                    id: randomUUID(),
                    payload: {
                        mongoId: metadata.id,
                        ...metadata,
                        content: textContent
                    },
                    vector: embedding
                }]
            });

            return true;
        } catch (error) {
            console.error("Error adding expense to Qdrant:", error);
            throw error;
        }
    }

    /**
     * Search for similar expenses using semantic search
     */
    async similaritySearch(query, k = 5) {
        try {
            if (!this.vectorStore) {
                await this.init();
            }

            // Create query embedding
            const queryEmbedding = await this.embeddings.embedQuery(query);

            // Search in Qdrant
            const searchResult = await this.client.search(COLLECTION_NAME, {
                vector: queryEmbedding,
                limit: k,
                with_payload: true
            });

            // Format results
            return searchResult.map(result => ({
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
        } catch (error) {
            console.error("Error during similarity search:", error);
            return [];
        }
    }

    /**
     * Delete an expense from the vector store
     * @param {string} expenseId - MongoDB ID of the expense to delete
     * @returns {Promise<boolean>} Success indicator
     */
    async deleteExpense(expenseId) {
        try {
            if (!this.vectorStore) {
                await this.init();
            }

            // Delete points with matching metadata.id
            await this.client.delete(COLLECTION_NAME, {
                filter: {
                    must: [
                        {
                            key: "payload.mongoId",
                            match: { value: expenseId }
                        }
                    ]
                }
            });

            return true;
        } catch (error) {
            console.error("Error deleting expense from Qdrant:", error);
            throw error;
        }
    }

    /**
     * Update an expense in the vector store
     * @param {Object} expense - Updated expense object
     * @returns {Promise<boolean>} Success indicator
     */
    async updateExpense(expense) {
        try {
            // Delete old version and add new version
            await this.deleteExpense(expense._id.toString());
            await this.addExpense(expense);
            return true;
        } catch (error) {
            console.error("Error updating expense in Qdrant:", error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const vectorStore = new VectorStoreService();
export default vectorStore;
