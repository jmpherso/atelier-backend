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

async function queryExecutionTime(query) {
  const start = performance.now();
  await client.query(query);
  const end = performance.now();
  console.log(`${query} in ${end - start} ms`);
}

async function functionExecutionTime(func, ...args) {
  const start = performance.now();
  await func(...args);
  const end = performance.now();
  console.log(`Execution time of ${func.name}: ${end - start} ms`);
}

async function test() {
    try {
      await client.connect();
      await functionExecutionTime(model.getProductMeta, 37313, (results) => {});
      await functionExecutionTime(model.getAllReviews, 37313, 250, 'newest', (results) => {});
      await queryExecutionTime(`SELECT * FROM reviews WHERE product_id=37311 ORDER BY date DESC OFFSET 0 ROWS FETCH FIRST 250 ROWS ONLY`);
      await queryExecutionTime(`SELECT * FROM reviews_photos WHERE review_id IN (214800, 214801, 214803, 214807)`);
      await queryExecutionTime(`SELECT * FROM characteristic_reviews WHERE review_id IN (214800, 214801, 214803, 214807)`);
      await queryExecutionTime(`SELECT * FROM characteristics WHERE product_id=37311`);
    } catch (err) {
      console.log(err);
    } finally {
      client.end();
    }
}

test();







