const db = require('./db/dbserver.js');
const axios = require('axios');

const getAllReviews = (product_id, count, callback) => {
  db.connect();
  db.query(`SELECT * FROM reviews WHERE product_id = ${product_id} LIMIT ${count}`, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(results.rows);
    }
    db.end();
  });
};

const getProductMeta = (product_id, count, callback) => {
  db.connect();
  db.query(`SELECT * FROM reviews WHERE product_id = ${product_id} LIMIT ${count}`, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(results.rows);
    }
    db.end();
  });
};

const postReview = (body, callback) => {
  db.connect();
  db.query(`INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES (${body.product_id}, ${body.rating}, ${body.date}, ${body.summary}, ${body.body}, ${body.recommend}, ${body.reported}, ${body.reviewer_name}, ${body.reviewer_email}, ${body.response}, ${body.helpfulness})`, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(results.rows);
    }
    db.end();
  });
};

const markHelpful = (body, callback) => {
  db.connect();
  db.query(`UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${body.review_id}`, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(results.rows);
    }
    db.end();
  });
};

const markReported = (body, callback) => {
  db.connect();
  db.query(`UPDATE reviews SET reported = true WHERE id = ${body.review_id}`, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(results.rows);
    }
    db.end();
  });
};

module.exports.getAllReviews = getAllReviews
module.exports.getProductMeta = getProductMeta
module.exports.postReview = postReview
module.exports.markHelpful = markHelpful
module.exports.markReported = markReported