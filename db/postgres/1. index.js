const pool = require("./0. pool");

async function testDB() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Connected! Current time:', res.rows[0]);
    } catch (err) {
        console.error('Connection error', err);
    } finally {
        pool.end();
    }
}

testDB();