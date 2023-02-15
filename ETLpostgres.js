
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'reviewsandratings',
    password: 'yourpassword',
    port: 5432,
});

client.connect();

client.query('COPY reviews FROM \'/home/jmpherso/course/RatingsAPI/reviews.csv\' DELIMITER \',\' CSV HEADER', (err, res) => {
    console.log(err, res);
    client.end();
})

client.query('COPY characteristics FROM \'/home/jmpherso/course/RatingsAPI/characteristics.csv\' DELIMITER \',\' CSV HEADER', (err, res) => {
    console.log(err, res);
    client.end();
})

client.query('COPY characteristic_reviews FROM \'/home/jmpherso/course/RatingsAPI/characteristic_reviews.csv\' DELIMITER \',\' CSV HEADER', (err, res) => {
    console.log(err, res);
    client.end();
})

client.query('COPY reviews_photos FROM \'/home/jmpherso/course/RatingsAPI/reviews_photos.csv\' DELIMITER \',\' CSV HEADER', (err, res) => {
    console.log(err, res);
    client.end();
})
