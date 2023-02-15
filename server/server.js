require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const qanda = require('./model');
const logger = require('./logger');
const axios = require('axios');
// const compression = require('compression');

const app = express();

app.use(cors());
app.use(logger);
app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.static(path.join(__dirname, '../public')));

app.get('/questions', (req, res) => {
  qanda.getQuestionList(req.query.product_id, req.query.count, (results) => {
    res.send(results);
  });
});

app.post('/cart', (req, res) => {
  qanda.postCart(req.body, (result) => {
    res.sendStatus(201).send();
  });
});

app.listen(process.env.PORT);
console.log(`Server listening at http://localhost:${process.env.PORT}`);