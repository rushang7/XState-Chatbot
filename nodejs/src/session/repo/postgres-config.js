const { Pool } = require('pg');

const pool = new Pool({
    user: 'mthirumalai',
    password: '',
    host: 'localhost',
    database: 'mthirumalai',
    port: 5432,
});

pool.on('error', (err, client) => {
    console.error('Error:', err);
});

module.exports = pool;