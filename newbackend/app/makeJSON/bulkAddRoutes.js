// app/makeJSON/bulkAddRoutes.js

import bulkAddController from "./bulkAddController.js";
import express from "express";

const bulkAddRouter = express.Router();

const bulkAddMiddleware = [bulkAddController.bulkAdd];
bulkAddRouter.post("/bulkAdd", bulkAddMiddleware);

export default bulkAddRouter;
