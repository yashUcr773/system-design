const { Client } = require("pg");

const client = new Client({
    host: "db",
    user: "postgres",
    password: "password",
    database: "demo",
});

async function main() {
    await client.connect();
    console.log("Connected to DB");

    // Create table
    await client.query(`
    DROP TABLE IF EXISTS users;
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email TEXT,
      name TEXT
    );
  `);

    console.log("Inserting 1,000,000 users...");

    // Insert 1 million users
    for (let i = 0; i < 1_000_000; i++) {
        await client.query(
            "INSERT INTO users (email, name) VALUES ($1, $2)",
            [`user${i}@test.com`, `User ${i}`]
        );
    }

    console.log("Insert complete");

    // Query WITHOUT index
    console.log("\nQuerying WITHOUT index...");
    console.time("no_index");

    const res1 = await client.query(
        "SELECT * FROM users WHERE email = 'user900000@test.com'"
    );

    console.timeEnd("no_index");
    console.log("Found:", res1.rows[0]);

    // Create index
    console.log("\nCreating index on email...");
    await client.query("CREATE INDEX idx_users_email ON users(email)");

    // Query WITH index
    console.log("\nQuerying WITH index...");
    console.time("with_index");

    const res2 = await client.query(
        "SELECT * FROM users WHERE email = 'user900000@test.com'"
    );

    console.timeEnd("with_index");
    console.log("Found:", res2.rows[0]);

    await client.end();
}

// Insert fast
async function main2() {
    await client.connect();
    console.log("Connected to DB");

    // Create table
    await client.query(`
    DROP TABLE IF EXISTS users;
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email TEXT,
      name TEXT
    );
  `);

    console.log("Inserting 1,000,000 users...");

    await client.query("BEGIN");

    for (let i = 0; i < 1_000_000; i++) {
        await client.query(
            "INSERT INTO users (email, name) VALUES ($1, $2)",
            [`user${i}@test.com`, `User ${i}`]
        );
    }

    await client.query("COMMIT");

    console.log("Insert complete");

    // Query WITHOUT index
    console.log("\nQuerying WITHOUT index...");
    console.time("no_index");

    const res1 = await client.query(
        "SELECT * FROM users WHERE email = 'user900000@test.com'"
    );

    console.timeEnd("no_index");
    console.log("Found:", res1.rows[0]);

    // Create index
    console.log("\nCreating index on email...");
    await client.query("CREATE INDEX idx_users_email ON users(email)");

    // Query WITH index
    console.log("\nQuerying WITH index...");
    console.time("with_index");

    const res2 = await client.query(
        "SELECT * FROM users WHERE email = 'user900000@test.com'"
    );

    console.timeEnd("with_index");
    console.log("Found:", res2.rows[0]);

    await client.end();
}

main();
