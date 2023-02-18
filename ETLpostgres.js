//Create Postgres connection
require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'reviewsandratings',
    password: process.env.PASSWORD,
    port: 5432,
});

//Create asynchelper function
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

//Create async function to drop tables
const deleteTables = async () => {
    return Promise.all([
        execute(`DROP TABLE IF EXISTS characteristic_reviews`),
        execute(`DROP TABLE IF EXISTS reviews_photos`),
        execute(`DROP TABLE IF EXISTS reviews`),
        execute(`DROP TABLE IF EXISTS characteristics`)
    ]);
};

//Create async function to create tables
const createMainTables = async () => {
    return Promise.all([
        execute(`CREATE TABLE reviews (
            id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
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
            id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            product_id INT,
            name VARCHAR
        );`)
    ]);
};

//Create async function to create reference tables
//Had to create separate function because of foreign key constraints
const createReferenceTables = async () => {
    return Promise.all([
        execute(`CREATE TABLE reviews_photos (
            id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            review_id INT references reviews(id),
            url VARCHAR
        );`),
        execute(`CREATE TABLE characteristic_reviews (
            id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            characteristic_id INT references characteristics(id),
            review_id INT references reviews(id),
            value INT
        );`)
    ]);
};

//Create async function to load data
const loadMainData = async () => {
    return Promise.all([
        execute('COPY reviews FROM \'/home/jmpherso/course/RatingsAPI/reviews.csv\' DELIMITER \',\' CSV HEADER'),
        execute('COPY characteristics FROM \'/home/jmpherso/course/RatingsAPI/characteristics.csv\' DELIMITER \',\' CSV HEADER')
    ]);
};

//Create async function to load reference data
//Had to create separate function because of foreign key constraints
const loadReferenceData = async () => {
    return Promise.all([
        execute('COPY characteristic_reviews FROM \'/home/jmpherso/course/RatingsAPI/characteristic_reviews.csv\' DELIMITER \',\' CSV HEADER'),
        execute('COPY reviews_photos FROM \'/home/jmpherso/course/RatingsAPI/reviews_photos.csv\' DELIMITER \',\' CSV HEADER')
    ]);
};

//Create async function to update sequence ids to end of table.
//COPY command does not update sequence ids, so this is necessary.
const updateMaxId = async () => {
    return Promise.all([
        execute('SELECT setval(\'reviews_id_seq\', (SELECT MAX(id) FROM reviews));'),
        execute('SELECT setval(\'characteristics_id_seq\', (SELECT MAX(id) FROM characteristics));'),
        execute('SELECT setval(\'reviews_photos_id_seq\', (SELECT MAX(id) FROM reviews_photos));'),
        execute('SELECT setval(\'characteristic_reviews_id_seq\', (SELECT MAX(id) FROM characteristic_reviews));')
    ]);
};

//Create async function to run all functions
const App = async () => {
    await client.connect();
    await deleteTables();
    await createMainTables();
    await createReferenceTables(); //Must load after createMainTables
    await loadMainData();
    await loadReferenceData(); //Must load after loadMainData
    await updateMaxId();
    await client.end();

};

App();
