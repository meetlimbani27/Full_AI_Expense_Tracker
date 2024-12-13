// app/chatQuery/chatQueryRoutes.js

const express = require('express');
const chatQueryRouter = express.Router();
const chatQueryController = require('./chatQueryController');


const chatQueryMiddleware = [
    chatQueryController.incomingChatQuery,
]
chatQueryRouter.post('/intent', chatQueryMiddleware);


module.exports = chatQueryRouter;


// const filterBookMiddleware = [
//   bookValidator.validateFilterBookMiddleware(),
//   validator.isError,
//   bookController.filterBook,
// ]
// bookRouter.post('/filter', filterBookMiddleware)
