// app/makeJSON/bulkAddRoutes.js

const bulkAddController = require('./bulkAddController');

const express = require('express');
const bulkAddRouter = express.Router();

const bulkAddMiddleware = [
    bulkAddController.bulkAdd,
]
bulkAddRouter.post('/bulkAdd', bulkAddMiddleware);


module.exports = bulkAddRouter;
