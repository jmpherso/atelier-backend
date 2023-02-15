
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'reviewsandratings',
    password: 'pokemon10',
    port: 5432,
});

const execute = async (query) => {
    try {
        const res = await client.query(query);

        if (res) {
            const querySplit = query.split(' ');
            if (querySplit[0] === 'DROP') {
                console.log(`TABLE ${querySplit[4].toUpperCase()} DROPPED`);
            } else if (querySplit[0] === 'CREATE') {
                console.log(`TABLE ${querySplit[2].toUpperCase()} CREATED`);
            } else {
                console.log(`${res.rowCount} ROWS INSERTED into ${querySplit[1].toUpperCase()}`);
            }
        }
    } catch (err) {
        console.error(err);
    }
};

const deleteTables = async () => {
    return Promise.all([
        execute(`DROP TABLE IF EXISTS characteristic_reviews`),
        execute(`DROP TABLE IF EXISTS reviews_photos`),
        execute(`DROP TABLE IF EXISTS reviews`),
        execute(`DROP TABLE IF EXISTS characteristics`)
    ]);
};

const createMainTables = async () => {
    return Promise.all([
        execute(`CREATE TABLE reviews (
            id INT PRIMARY KEY,
            product_id INT,
            rating INT,
            date BIGINT,
            summary VARCHAR,
            body VARCHAR,
            recommend BOOLEAN,
            reported BOOLEAN,
            reviewer_name VARCHAR,
            reviewer_email VARCHAR,
            response VARCHAR,
            helpfulness INT
        );`),
        execute(`CREATE TABLE characteristics (
            id INT PRIMARY KEY,
            product_id INT,
            name VARCHAR
        );`)
    ]);
};

const createReferenceTables = async () => {
    return Promise.all([
        execute(`CREATE TABLE reviews_photos (
            id INT PRIMARY KEY,
            review_id INT references reviews(id),
            url VARCHAR
        );`),
        execute(`CREATE TABLE characteristic_reviews (
            id INT PRIMARY KEY,
            characteristic_id INT references characteristics(id),
            review_id INT references reviews(id),
            value INT
        );`)
    ]);
};

const loadMainData = async () => {
    return Promise.all([
        execute('COPY reviews FROM \'/home/jmpherso/course/RatingsAPI/reviews.csv\' DELIMITER \',\' CSV HEADER'),
        execute('COPY characteristics FROM \'/home/jmpherso/course/RatingsAPI/characteristics.csv\' DELIMITER \',\' CSV HEADER')
    ]);
};

const loadReferenceData = async () => {
    return Promise.all([
        execute('COPY characteristic_reviews FROM \'/home/jmpherso/course/RatingsAPI/characteristic_reviews.csv\' DELIMITER \',\' CSV HEADER'),
        execute('COPY reviews_photos FROM \'/home/jmpherso/course/RatingsAPI/reviews_photos.csv\' DELIMITER \',\' CSV HEADER')
    ]);
};

const App = async () => {
    await client.connect();
    await deleteTables();
    await createMainTables();
    await createReferenceTables();
    await loadMainData();
    await loadReferenceData();
    await client.end();
};

App();