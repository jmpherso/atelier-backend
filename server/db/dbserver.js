// Basic Postgres DB connection
const { Client } = require('pg');
const dbserver = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'reviewsandratings',
    password: 'pokemon10',
    port: 5432,
});

dbserver.connect();
console.log('Postgres connected, listening on port 5432')

module.exports = dbserver;