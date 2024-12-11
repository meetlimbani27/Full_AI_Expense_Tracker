'use strict';
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors()); 
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Finsy backend!');
});

app.use('/', require('./modules/addExpenses/addExpenseRoutes'));


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
