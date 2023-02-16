require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'reviewsandratings',
    password: process.env.PASSWORD,
    port: 5432,
});

const readCSV = (file) => {


