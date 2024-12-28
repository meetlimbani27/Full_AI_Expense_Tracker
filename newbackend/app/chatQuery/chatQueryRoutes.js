// app/chatQuery/chatQueryRoutes.js

// const express = require("express");
// const chatQueryRouter = express.Router();
// const chatQueryController = require("./chatQueryController");

import express from "express";
import chatQueryController from "./chatQueryController.js";
const chatQueryRouter = express.Router();

const chatQueryMiddleware = [chatQueryController.incomingChatQuery];
chatQueryRouter.post("/intent", chatQueryMiddleware);

export default chatQueryRouter;
// const filterBookMiddleware = [
//   bookValidator.validateFilterBookMiddleware(),
//   validator.isError,
//   bookController.filterBook,
// ]
// bookRouter.post('/filter', filterBookMiddleware)
