// Basic Postgres DB connection
require('dotenv').config();
const { Client } = require('pg');
const dbserver = new Client({
    user: 'postgres',
    host: 'ec2-3-137-207-206.us-east-2.compute.amazonaws.com',
    database: 'reviewsandratings',
    password: process.env.PASSWORD,
    port: 5432,
});

dbserver.connect();
console.log('Postgres connected, listening on port 5432')

module.exports = dbserver;