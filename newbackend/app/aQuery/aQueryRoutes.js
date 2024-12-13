// app/aQuery/aQueryRoutes.js

const express = require('express');
const aQueryRouter = express.Router();
const aQueryController = require('./aQueryController');


const aQueryMiddleware = [
    aQueryController.getAQuery,
]
aQueryRouter.get('/test', aQueryMiddleware);


module.exports = aQueryRouter;


// const filterBookMiddleware = [
//   bookValidator.validateFilterBookMiddleware(),
//   validator.isError,
//   bookController.filterBook,
// ]
// bookRouter.post('/filter', filterBookMiddleware)
