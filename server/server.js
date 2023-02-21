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

app.get('loaderio-4752e35eb062480bb88a9ea8f3008b23'), (req, res) => {
  res.send('loaderio-4752e35eb062480bb88a9ea8f3008b23');
};

app.get('/reviews', (req, res) => {
  model.getAllReviews(req.query.product_id, req.query.count, req.query['sort'])
  .then((results) => {
    res.statusCode = 200;
    res.send(results);
  });
});

app.get('/reviews/meta', (req, res) => {
  model.getProductMeta(req.query.product_id)
  .then((results) => {
    res.statusCode = 200;
    res.send(results);
  });
});

app.post('/reviews', (req, res) => {
  model.postReview(req.body, (result) => {
    res.sendStatus(201).send();
  });
});

app.put('/reviews/:review_id/helpful', (req, res) => {
  model.markHelpful(req.params.review_id, (result) => {
    res.sendStatus(201).send();
  });
});

app.put('/reviews/:review_id/report', (req, res) => {
  model.markReported(req.params.review_id, (result) => {
    res.sendStatus(201).send();
  });
});

app.listen(process.env.PORT);
console.log(`Server listening at ${process.env.PORT}`);