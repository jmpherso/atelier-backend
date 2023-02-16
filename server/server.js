require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const model = require('./model');
const logger = require('./logger');
const axios = require('axios');
// const compression = require('compression');

const app = express();

app.use(cors());
app.use(logger);
app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.static(path.join(__dirname, '../public')));

app.get('/reviews', (req, res) => {
  console.log('got request', req.query) //got request { product_id: '37311', sort: 'relevant', count: '250' }
  model.getAllReviews(req.query.product_id, req.query.count, req.query['sort'], (results) => {
    res.send(results);
  });
});

app.get('/reviews/meta', (req, res) => {
  model.getProductMeta(req.query.product_id, (results) => {
    res.send(results);
  });
});

app.post('/reviews', (req, res) => {
  model.postReview(req.body, (result) => {
    res.sendStatus(201).send();
  });
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  model.markHelpful(req.body, (result) => {
    res.sendStatus(201).send();
  });
});

app.put('/reviews/:review_id/report', (req, res) => {
  model.markReported(req.body, (result) => {
    res.sendStatus(201).send();
  });
});

app.listen(process.env.PORT);
console.log(`Server listening at http://localhost:${process.env.PORT}`);