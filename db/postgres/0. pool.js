const { Pool } = require('pg');

const pool = new Pool({
  user: 'myuser1',
  host: '100.70.160.90',
  database: 'mydatabase1',
  password: 'Compro11',
  port: 5432,
});

module.exports = pool;