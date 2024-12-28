"use strict";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

// const connectDB = require("./db/index");
import connectDB from "./db/index.js";

const app = express();
const PORT = 8000;
app.use(cors());
app.use(express.json());

//Routes
import chatQueryRoutes from "./app/chatQuery/chatQueryRoutes.js";
import bulkAddRoutes from "./app/makeJSON/bulkAddRoutes.js";

app.use("/api/chatQuery", chatQueryRoutes);
app.use("/api/bulkAdd", bulkAddRoutes);

let API_KEY = process.env.OPENAI_API_KEY;
console.log(API_KEY);

// Start Server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      connectDB()
        .then(() => {
          // Start your server or continue with your application
        })
        .catch((error) => {
          console.error("Error connecting to MongoDB:", error);
          process.exit(1); // Exit process with failure
        });
    });
    console.log("**************************************************\n\n");
  } catch (error) {
    console.error("Error starting server:", error);
  }
};
startServer();
