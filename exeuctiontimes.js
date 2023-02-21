require('dotenv').config();
const model = require('./server/model');
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'reviewsandratings',
    password: process.env.PASSWORD,
    port: 5432,
});

const body = {
  review_id: 214800,
  product_id: 37313,
  rating: 5,
  summary: 'This product was great!',
  body: 'I really did or did not like this product based on whether it was sustainably sourced.',
  recommend: true,
  name: 'jbilas',
  email: 'okokok@okoko.com',
  photos: [],
  characteristics: { 124808: 5 }
};

async function queryAverageExecutionTime(query) {
  const start = performance.now();
  for (let i = 0; i < 10; i++) {
    await client.query(query);
  }
  const end = performance.now();
  console.log(`${query} in ${(end - start)/10} ms average over 10 runs.`);
}

async function queryExecutionTime(query) {
  const start = performance.now();
  await client.query(query);
  const end = performance.now();
  console.log(`${query} in ${(end - start)} ms`);
}

async function functionAverageExecutionTime(func, ...args) {
  const start = performance.now();
  for (let i = 0; i < 10; i++) {
    await func(...args);
  }
  const end = performance.now();
  console.log(`Execution time of ${func.name}: ${(end - start)/10} ms average over 100 runs.`);
}

async function functionExecutionTime(func, ...args) {
  const start = performance.now();
  await func(...args);
  const end = performance.now();
  console.log(`Execution time of ${func.name}: ${(end - start)} ms`);
}

async function test() {
    try {
      await client.connect();
      await functionExecutionTime(model.postReview, body);
      await functionExecutionTime(model.getProductMeta, 37313);
      await functionExecutionTime(model.getAllReviews, 37313, 250, 'newest');
      await functionExecutionTime(model.markReported, body.review_id);
      await functionExecutionTime(model.markHelpful, body.review_id);
      await queryExecutionTime(`SELECT * FROM reviews WHERE product_id=37311 ORDER BY date DESC OFFSET 0 ROWS FETCH FIRST 250 ROWS ONLY`);
      await queryExecutionTime(`SELECT * FROM reviews_photos WHERE review_id IN (214800, 214801, 214803, 214807)`);
      await queryExecutionTime(`SELECT * FROM characteristic_reviews WHERE review_id IN (214800, 214801, 214803, 214807)`);
      await queryExecutionTime(`SELECT * FROM characteristics WHERE product_id=37311`);
    } catch (err) {
      console.log('ERROR', err);
    } finally {
      await client.end();
    }
}

test();









