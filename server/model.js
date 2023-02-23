const db = require('./db/dbserver.js');
const axios = require('axios');

//Pull all reviews model.
const getAllReviews = async (product_id, count, sortParam) => {
  try {
    //Transform sortParam to SQL syntax
    let orderBy = '';
    if(sortParam === 'newest') {
      orderBy = 'ORDER BY date DESC';
    } else if(sortParam === 'helpful') {
      orderBy = 'ORDER BY helpfulness DESC';
    } else if(sortParam === 'relevant') {
      orderBy = 'ORDER BY helpfulness DESC, date DESC';
    }
    //Query DB for reviews and photos for product_id, sorted by sortParam and limited to count
    const results = await db.query(`
      SELECT reviews.id, reviews.product_id, reviews.rating, reviews.date, reviews.summary, reviews.body, reviews.recommend,
        reviews.reported, reviews.reviewer_name, reviews.reviewer_email, reviews.response, reviews.helpfulness,
        reviews_photos.id AS photo_id, reviews_photos.url AS photo_url
      FROM reviews
      LEFT JOIN reviews_photos ON reviews.id = reviews_photos.review_id
      WHERE reviews.product_id = $1 AND reviews.reported = false
      ${orderBy}
      OFFSET 0 ROWS FETCH FIRST $2 ROWS ONLY`,
      [product_id, count]
    );
    // Group the results by review id to avoid nested loops
    const reviewMap = {};
    results.rows.forEach(row => {
      if (!reviewMap[row.id]) {
        reviewMap[row.id] = {
          id: row.id,
          product_id: row.product_id,
          rating: row.rating,
          date: new Date(Number(row.date)).toISOString().slice(0, 10),
          summary: row.summary,
          body: row.body,
          recommend: row.recommend,
          response: row.response,
          reported: row.reported,
          reviewer_name: row.reviewer_name,
          reviewer_email: row.reviewer_email,
          helpfulness: row.helpfulness,
          photos: [],
        };
      }
      if (row.photo_id) {
        reviewMap[row.id].photos.push({ id: row.photo_id, url: row.photo_url });
      }
    });
    const reviews = Object.values(reviewMap);
    return { product: product_id, page: 0, count: count, results: reviews };
  } catch (err) {
    console.log(err);
    return err;
  }
};

//Function to create meta data. Might be better off making this into one function with getAllReviews.
const getProductMeta = async (product_id) => {
  try {
    // Query DB for reviews and characteristics for product_id
    const results = await db.query(`
      SELECT r.*, c.id AS char_id, c.name AS char_name, cr.value
      FROM reviews r
      LEFT JOIN characteristic_reviews cr ON cr.review_id = r.id
      LEFT JOIN characteristics c ON cr.characteristic_id = c.id
      WHERE r.product_id=${product_id}
    `);

    // Initialize meta object
    const meta = {
      ratings: [0, 0, 0, 0, 0],
      recommended: { false: 0, true: 0 },
      characteristics: {},
      reviewIDs: [],
    };

    // Loop through results to add ratings, recommended, and characteristics to meta object
    for (const row of results.rows) {
      if (row.reported === true) {
        continue;
      }
      meta.ratings[row.rating - 1]++;
      meta.recommended[row.recommend]++;
      meta.reviewIDs.push(row.id);

      if (row.char_id && row.char_name) {
        if (!meta.characteristics[row.char_id]) {
          meta.characteristics[row.char_id] = {
            id: row.char_id,
            name: row.char_name,
            value: 0,
          };
        }
        meta.characteristics[row.char_id].value += row.value;
      }
    }

    // Calculate average characteristic value
    const reviewCount = meta.reviewIDs.length;
    for (const charId in meta.characteristics) {
      meta.characteristics[charId].value /= reviewCount;
    }

    // Create result object in expected format
    const resultObject = {
      product_id: product_id,
      ratings: {},
      recommended: meta.recommended,
      characteristics: {},
    };

    // Add ratings to result object
    for (let i = 0; i < meta.ratings.length; i++) {
      resultObject.ratings[i + 1] = meta.ratings[i];
    }

    // Add characteristics to result object in expected format
    for (const charId in meta.characteristics) {
      const char = meta.characteristics[charId];
      resultObject.characteristics[char.name] = {
        id: char.id,
        value: char.value,
      };
    }

    // Send result object to server
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