const assert = require('chai').assert;
const model = require('./server/model');

const data = {
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

it('Testing postReview', async () => {
  const result = await model.postReview(data);
  assert.equal(typeof result, 'number');
});

it('Testing getAllReviews', async () => {
  const result = await model.getAllReviews(37313, 250, 'newest');
  assert.equal(result.product, '37313');
  assert.equal(result.count, 250);
  assert.equal(result.page, 0);
  assert.equal(result.results[0].rating, 5);
});

it('Testing getProductMeta', async () => {
  const result = await model.getProductMeta(37313);
  assert.isNotEmpty(result);
}).timeout(10000);

it('Testing markkHelpful', async () => {
  const preHelpful = await model.getAllReviews(37313, 250, 'newest');
  const reviewID = preHelpful.results[0].id;
  const result = await model.markHelpful(reviewID);
  const postHelpful = await model.getAllReviews(37313, 250, 'newest');
  assert.equal(preHelpful.results[0].helpfulness + 1, postHelpful.results[0].helpfulness);
});