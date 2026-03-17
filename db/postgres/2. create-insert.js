import { Pool } from 'pg';

/**
 * Base database configuration
 */
const config = {
    user: 'myuser1',
    host: '100.70.160.90',
    password: 'Compro11',
    port: 5432,
};

/**
 * Initialize database:
 * 1. Connect to default 'postgres' DB
 * 2. Create 'countries' DB if it doesn't exist
 * 3. Connect to 'countries'
 * 4. Create table if it doesn't exist
 */
async function initDatabase() {
    let defaultPool;
    let countriesPool;

    try {
        // -----------------------------
        // STEP 1: Connect to postgres
        // -----------------------------
        defaultPool = new Pool({
            ...config,
            database: 'postgres',
        });

        console.log('Checking if database "countries" exists...');

        const dbCheck = await defaultPool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            ['countries']
        );

        // -----------------------------
        // STEP 2: Create database if missing
        // -----------------------------
        if (dbCheck.rowCount === 0) {
            await defaultPool.query('CREATE DATABASE countries');
            console.log('Database "countries" created.');
        } else {
            console.log('Database "countries" already exists.');
        }

        // Close default connection
        await defaultPool.end();

        // -----------------------------
        // STEP 3: Connect to countries DB
        // -----------------------------
        countriesPool = new Pool({
            ...config,
            database: 'countries',
        });

        await countriesPool.query('SELECT NOW()');
        console.log('Connected to "countries" database.');

        // -----------------------------
        // STEP 4: Create table safely
        // -----------------------------
        await countriesPool.query(`
            CREATE TABLE IF NOT EXISTS cities (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                country VARCHAR(50) NOT NULL,
                population INTEGER,
                area INTEGER
            )
        `);

        console.log('Table "cities" is ready.');

    } catch (error) {
        console.error('Database initialization failed:', error);
    } finally {
        // Ensure connections are always closed
        if (defaultPool) await defaultPool.end().catch(() => { });
        if (countriesPool) await countriesPool.end().catch(() => { });
    }
}

async function insertData() {
    let countriesPool;
    try {
        countriesPool = new Pool({
            ...config,
            database: 'countries',
        });

        countriesPool.query('INSERT INTO cities Values')

    } catch (error) {
        console.error('Database initialization failed:', error);
    } finally {
        // Ensure connections are always closed
        if (defaultPool) await defaultPool.end().catch(() => { });
        if (countriesPool) await countriesPool.end().catch(() => { });
    }
}

initDatabase();
insertData();