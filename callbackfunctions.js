//Pull all reviews model.
const getAllReviews = (product_id, count, sortParam, callback) => {
  //Transform sortParam to SQL syntax
  if(sortParam === 'newest') {
    sortParam = 'date DESC';
  } else if(sortParam === 'helpful') {
    sortParam = 'helpfulness DESC';
  } else if(sortParam === 'relevant') {
    sortParam = 'helpfulness DESC, date DESC';
  }
  //Query DB for count number of reviews for product_id, sorted by sortParam
  db.query(`SELECT * FROM reviews WHERE product_id=${product_id} ORDER BY ${sortParam} OFFSET 0 ROWS FETCH FIRST ${count} ROWS ONLY`, (err, results) => {
    if (err) {
      console.log(err)
      callback(err);
    } else {
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
      for(let i = 0; i < results.rows.length; i++) {
        results.rows[i].date = new Date(Number(results.rows[i].date)).toISOString().slice(0, 10);
      }
      //Query DB for photos for each review
      db.query(`SELECT * FROM reviews_photos WHERE review_id IN (${reviewIDs})`, (err, resultsTwo) => {
        if(err) {
          console.log(err)
          callback(err);
        } else {
          //For loop to add photos with matching review ID to each review (might be able to optimize this)
          for(let i = 0; i < results.rows.length; i++) {
            for(let j = 0; j < resultsTwo.rows.length; j++) {
              if(results.rows[i].id === resultsTwo.rows[j].review_id) {
                results.rows[i].photos.push({id : resultsTwo.rows[j].id, url : resultsTwo.rows[j].url});
              }
            }
          }
          //Send results to server in expected format.
          callback({product : product_id, page : 0, count : count, results : results.rows});
        }
      });
    }
  });
};
