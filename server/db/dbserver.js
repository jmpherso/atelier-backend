// Basic Postgres DB connection
require('dotenv').config();
const { Client } = require('pg');
const dbserver = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'reviewsandratings',
    password: 'process.env.PASSWORD',
    port: 5432,
});

dbserver.connect();
console.log('Postgres connected, listening on port 5432')

module.exports = dbserver;