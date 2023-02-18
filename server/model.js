const db = require('./db/dbserver.js');
const axios = require('axios');

//Pull all reviews model.
const getAllReviews = async (product_id, count, sortParam) => {
  try {
    //Transform sortParam to SQL syntax
    if(sortParam === 'newest') {
      sortParam = 'date DESC';
    } else if(sortParam === 'helpful') {
      sortParam = 'helpfulness DESC';
    } else if(sortParam === 'relevant') {
      sortParam = 'helpfulness DESC, date DESC';
    }
    //Query DB for count number of reviews for product_id, sorted by sortParam
    const results = await db.query(`SELECT * FROM reviews WHERE product_id=${product_id} ORDER BY ${sortParam} OFFSET 0 ROWS FETCH FIRST ${count} ROWS ONLY`)
    let reviewIDs = [];
    //Remove response (unused?) add empty photo arrays to each review, also add reviewIDs to array for next query
    for (let i = 0; i < results.rows.length; i++) {
      if (results.rows[i].reported === true) {
        results.rows.splice(i, 1);
        i--;
      } else {
        results.rows[i].response = null;
        results.rows[i].photos = [];
        reviewIDs.push(results.rows[i].id);
      }
    }
    //Query requires a string of reviewIDs, so join the array into a string
    reviewIDs = reviewIDs.join(', ');
    //For loop to convert date to ISO format
    results.rows.map((review) => {
      review.date = new Date(Number(review.date)).toISOString().slice(0, 10);
    })
    //Query DB for photos for each review
    const resultsTwo = await db.query(`SELECT * FROM reviews_photos WHERE review_id IN (${reviewIDs})`);
    //For loop to add photos with matching review ID to each review (might be able to optimize this)
    for(let i = 0; i < results.rows.length; i++) {
      for(let j = 0; j < resultsTwo.rows.length; j++) {
        if(results.rows[i].id === resultsTwo.rows[j].review_id) {
          results.rows[i].photos.push({id : resultsTwo.rows[j].id, url : resultsTwo.rows[j].url});
        }
      }
    }
    return {product : product_id, page : 0, count : count, results : results.rows};
  } catch (err) {
    console.log(err);
    return err;
  }
};

//Function to create meta data. Might be better off making this into one function with getAllReviews.
const getProductMeta = async (product_id) => {
  try {
    //Initialize meta object
    var meta = {};
    meta.ratings = [0, 0, 0, 0, 0];
    meta.recommended = {false : 0, true : 0};
    meta.characteristics = {};
    meta.reviewIDs = [];

    //Query DB for reviews for product_id
    const results = await db.query(`SELECT * FROM reviews WHERE product_id=${product_id}`);
    //For loop to add ratings and recommended to meta object for each review, also make array of reviewIDs for next query
    for (let i = 0; i < results.rows.length; i++) {
      if( results.rows[i].reported === true) {
        results.rows.splice(i, 1);
        i--;
      } else {
        meta.ratings[results.rows[i].rating - 1]++;
        meta.recommended[results.rows[i].recommend]++;
        meta.reviewIDs.push(results.rows[i].id);
      }
    }
    //ReviewID needs to be a string for next query, so join the array into a string
    meta.reviewIDs = meta.reviewIDs.join(', ')
    // Query DB for characteristics for product_id
    const resultsTwo = await db.query(`SELECT * FROM characteristics WHERE product_id=${product_id}`);
    //For loop to add characteristics to meta object
    for (let i = 0; i < resultsTwo.rows.length; i++) {
      meta.characteristics[resultsTwo.rows[i].id] = {};
      meta.characteristics[resultsTwo.rows[i].id].id = resultsTwo.rows[i].id;
      meta.characteristics[resultsTwo.rows[i].id].value = 0;
      meta.characteristics[resultsTwo.rows[i].id].name = resultsTwo.rows[i].name;
    }
    //Query DB for characteristic_reviews for each review
    const resultsThree = await db.query(`SELECT * FROM characteristic_reviews WHERE review_id IN (${meta.reviewIDs})`);
    meta.reviewIDs = meta.reviewIDs.split(', ');
    //For loop to sum characteristic values in meta object
    for (let i = 0; i < resultsThree.rows.length; i++) {
      meta.characteristics[resultsThree.rows[i].characteristic_id].value += resultsThree.rows[i].value;
    }
    //For loop to calculate average characteristic value
    for (let key in meta.characteristics) {
      meta.characteristics[key].value = meta.characteristics[key].value / meta.reviewIDs.length;
    }
    //Create result object in expected format
    var resultObject = {};
    resultObject.product_id = product_id;
    resultObject.ratings = {};
    //For loop to add ratings to result object
    for (let i = 0; i < meta.ratings.length; i++) {
      resultObject.ratings[i + 1] = meta.ratings[i];
    }
    resultObject.recommended = meta.recommended;
    resultObject.characteristics = {};
    //For loop to add characteristics to result object in expected format
    for (let key in meta.characteristics) {
      resultObject.characteristics[meta.characteristics[key].name] = {};
      resultObject.characteristics[meta.characteristics[key].name].id = meta.characteristics[key].id;
      resultObject.characteristics[meta.characteristics[key].name].value = meta.characteristics[key].value;
    }
    //Send result object to server
    return resultObject;
  } catch (err) {
    console.log(err);
    return err;
  }
};

//Function to post a review
const postReview = async (body) => {
  try {
    //Query DB to add review to reviews table
    const results = await db.query(`INSERT INTO reviews (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES (${body.product_id}, ${body.rating}, ${Number(new Date())}, '${body.summary}', '${body.body}', '${body.recommend}', 'false', '${body.name}', '${body.email}', 'null', 0) RETURNING id`);
    if (body.photos.length > 0) {
      //Create array of photo SQL strings to be used in next query
      let photoArray = body.photos.map((photo) => {
        return `(${results.rows[0].id}, '${photo}')`;
      });
      photoArray = photoArray.join(', ');
      //Query DB to add photos to reviews_photos table if photos were included in request
      const resultsTwo = await db.query(`INSERT INTO reviews_photos (review_id, url) VALUES ${photoArray}`);
    }
    //Create characterstic ID SQL string to be used in next query
    let characteristicIDString = [];
    for (let key in body.characteristics) {
      characteristicIDString.push(`(${key}, ${results.rows[0].id}, ${body.characteristics[key]})`);
    }
    characteristicIDString = characteristicIDString.join(', ');
    //Query DB to add characteristic reviews to characteristic_reviews table
    const resultsThree = await db.query(`INSERT INTO characteristic_reviews (characteristic_id, review_id, value) VALUES ${characteristicIDString}`);
    return results.rows[0].id;
  } catch (err) {
    console.log('ERR', err);
    return err;
  }
};

//Function to mark a review as helpful
const markHelpful = async (review_id) => {
  try {
    //Query DB to update helpfulness of review
    const results = await db.query(`UPDATE reviews SET helpfulness = helpfulness + 1 WHERE id = ${review_id}`);
    return results;
  } catch (err) {
    console.log(err);
    return err;
  }
};



//Function to mark a review as reported
const markReported = async (review_id) => {
  try {
    //Query DB to update reported status of review
    const results = await db.query(`UPDATE reviews SET reported = 'true' WHERE id = ${review_id}`);
    return results;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports.getAllReviews = getAllReviews
module.exports.getProductMeta = getProductMeta
module.exports.postReview = postReview
module.exports.markHelpful = markHelpful
module.exports.markReported = markReported