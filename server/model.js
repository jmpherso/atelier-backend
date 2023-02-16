const db = require('./db/dbserver.js');
const axios = require('axios');

const getAllReviews = (product_id, count, sortParam, callback) => { //ORDER BY ${sortParam}
  db.query(`SELECT * FROM reviews WHERE product_id=${product_id} OFFSET 0 ROWS FETCH FIRST ${count} ROWS ONLY`, (err, results) => {
    if (err) {
      console.log(err)
      callback(err);
    } else {
      callback({product : product_id, page : 0, count : count, results : results.rows});
    }
  });
};

const getProductMeta = (product_id, callback) => {
  var meta = {};
  meta.ratings = [0, 0, 0, 0, 0];
  meta.recommended = {false : 0, true : 0};
  meta.characteristics = {};
  meta.reviewIDs = [];

  db.query(`SELECT * FROM reviews WHERE product_id=${product_id}`, (err, results) => {
    if (err) {
      console.log(err)
      callback(err);
    } else {
      for (let i = 0; i < results.rows.length; i++) {
        meta.ratings[results.rows[i].rating - 1]++;
        meta.recommended[results.rows[i].recommend]++;
        meta.reviewIDs.push(results.rows[i].id);
      }
      meta.reviewIDs = meta.reviewIDs.join(', ')
      console.log('METADATA', meta)
      db.query(`SELECT * FROM characteristics WHERE product_id=${product_id}`, (err, resultsTwo) => {
        if (err) {
          console.log(err)
          callback(err);
        } else {
          for (let i = 0; i < resultsTwo.rows.length; i++) {
            meta.characteristics[resultsTwo.rows[i].id] = {};
            meta.characteristics[resultsTwo.rows[i].id].id = resultsTwo.rows[i].id;
            meta.characteristics[resultsTwo.rows[i].id].value = 0;
            meta.characteristics[resultsTwo.rows[i].id].name = resultsTwo.rows[i].name;
          }
          console.log('METADATA', meta)
          db.query(`SELECT * FROM characteristic_reviews WHERE review_id IN (${meta.reviewIDs})`, (err, resultsThree) => {
            meta.reviewIDs = meta.reviewIDs.split(', ');
            if (err) {
              console.log(err)
              callback(err);
            } else {
              for (let i = 0; i < resultsThree.rows.length; i++) {
                meta.characteristics[resultsThree.rows[i].characteristic_id].value += resultsThree.rows[i].value;
              }
              for (let key in meta.characteristics) {
                meta.characteristics[key].value = meta.characteristics[key].value / meta.reviewIDs.length;
              }
              console.log('METADATA', meta)
              var resultObject = {};
              resultObject.product_id = product_id;
              resultObject.ratings = {};
              for (let i = 0; i < meta.ratings.length; i++) {
                resultObject.ratings[i + 1] = meta.ratings[i];
              }
              resultObject.recommended = meta.recommended;
              resultObject.characteristics = {};
              for (let key in meta.characteristics) {
                resultObject.characteristics[meta.characteristics[key].name] = {};
                resultObject.characteristics[meta.characteristics[key].name].id = meta.characteristics[key].id;
                resultObject.characteristics[meta.characteristics[key].name].value = meta.characteristics[key].value;
              }
              console.log('RESULT OBJECT', resultObject);
              callback(resultObject);
            }
          });
        }
      });
    }
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