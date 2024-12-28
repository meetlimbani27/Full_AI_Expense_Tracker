// db/index.js
import mongoose from "mongoose";

const connectDB = async () => {
  console.log("connectDB hit", process.env.MONGODB_DB_NAME);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Instead of module.exports = connectDB
export default connectDB;
