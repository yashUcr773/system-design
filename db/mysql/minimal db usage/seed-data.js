const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration (same as server.js)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'testdb1',
    port: process.env.DB_PORT || 3306
};

// Sample data arrays for generating realistic names and emails
const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Emma',
    'William', 'Olivia', 'James', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Sophia',
    'Henry', 'Charlotte', 'Alexander', 'Mia', 'Mason', 'Amelia', 'Ethan', 'Harper',
    'Daniel', 'Evelyn', 'Matthew', 'Abigail', 'Anthony', 'Ella', 'Christopher', 'Scarlett',
    'Joshua', 'Grace', 'Andrew', 'Chloe', 'Ryan', 'Victoria', 'Nicholas', 'Madison',
    'Tyler', 'Luna', 'Jacob', 'Penelope', 'Aaron', 'Layla', 'Jose', 'Riley',
    'Samuel', 'Zoey', 'Logan', 'Nora', 'Nathan', 'Lily', 'Elijah', 'Eleanor'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker'
];

const emailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
    'icloud.com', 'protonmail.com', 'company.com', 'email.com', 'mail.com'
];

// Utility functions
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateRandomAge() {
    // Generate ages between 18 and 80
    return Math.floor(Math.random() * 63) + 18;
}

function generateRandomEmail(firstName, lastName) {
    const domain = getRandomElement(emailDomains);
    const patterns = [
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
        `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
        `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
        `${firstName.toLowerCase()}${Math.floor(Math.random() * 1000)}@${domain}`,
        `${firstName.toLowerCase().charAt(0)}${lastName.toLowerCase()}@${domain}`
    ];
    return getRandomElement(patterns);
}

function generateRandomUser() {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = generateRandomEmail(firstName, lastName);
    const age = generateRandomAge();

    return { name, email, age };
}

// Database operations
async function connectToDatabase() {
    try {
        const db = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database');
        return db;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
}

async function clearExistingData(db) {
    try {
        const [result] = await db.execute('DELETE FROM users');
        console.log(`🗑️  Cleared ${result.affectedRows} existing records`);
    } catch (error) {
        console.error('❌ Error clearing existing data:', error.message);
        throw error;
    }
}

async function insertRandomUsers(db, count) {
    console.log(`📝 Generating ${count} random users...`);

    const users = [];
    const emailSet = new Set(); // To ensure unique emails

    while (users.length < count) {
        const user = generateRandomUser();

        // Ensure email uniqueness
        if (!emailSet.has(user.email)) {
            emailSet.add(user.email);
            users.push(user);
        }
    }

    console.log(`📤 Inserting ${users.length} users into database...`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
        try {
            await db.execute(
                'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
                [user.name, user.email, user.age]
            );
            insertedCount++;

            // Show progress for large datasets
            if (insertedCount % 50 === 0) {
                console.log(`   📊 Inserted ${insertedCount}/${count} users...`);
            }
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                skippedCount++;
                console.log(`   ⚠️  Skipped duplicate email: ${user.email}`);
            } else {
                console.error(`   ❌ Error inserting user ${user.name}:`, error.message);
            }
        }
    }

    console.log(`✅ Successfully inserted ${insertedCount} users`);
    if (skippedCount > 0) {
        console.log(`⚠️  Skipped ${skippedCount} duplicate entries`);
    }

    return insertedCount;
}

async function verifyData(db) {
    try {
        const [rows] = await db.execute('SELECT COUNT(*) as total FROM users');
        const total = rows[0].total;
        console.log(`📊 Total users in database: ${total}`);

        if (total > 0) {
            const [sampleRows] = await db.execute('SELECT * FROM users ORDER BY created_at DESC LIMIT 5');
            console.log('\n📋 Sample of recent users:');
            sampleRows.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name} (${user.email}) - Age: ${user.age}`);
            });
        }
    } catch (error) {
        console.error('❌ Error verifying data:', error.message);
    }
}

// Main function
async function seedDatabase() {
    let db;

    try {
        // Parse command line arguments
        const args = process.argv.slice(2);
        let userCount = 100; // default
        let clearData = false;

        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--count' || args[i] === '-c') {
                userCount = parseInt(args[i + 1]) || 100;
                i++; // skip next argument
            } else if (args[i] === '--clear') {
                clearData = true;
            } else if (args[i] === '--help' || args[i] === '-h') {
                console.log(`
                    🌱 Database Seeding Script

                    Usage: node seed-data.js [options]

                    Options:
                    --count, -c <number>    Number of users to generate (default: 100)
                    --clear                 Clear existing data before seeding
                    --help, -h              Show this help message

                    Examples:
                    node seed-data.js                    # Generate 100 users
                    node seed-data.js --count 500        # Generate 500 users
                    node seed-data.js --clear --count 50 # Clear data and generate 50 users
                            `
                );
                return;
            }
        }

        console.log('🌱 Starting database seeding process...\n');

        // Connect to database
        db = await connectToDatabase();

        // Clear existing data if requested
        if (clearData) {
            await clearExistingData(db);
        }

        // Insert random users
        const insertedCount = await insertRandomUsers(db, userCount);

        // Verify the data
        await verifyData(db);

        console.log('\n🎉 Database seeding completed successfully!');

    } catch (error) {
        console.error('\n💥 Seeding process failed:', error.message);
        process.exit(1);
    } finally {
        if (db) {
            await db.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Seeding process interrupted');
    process.exit(0);
});

// Run the seeding process
if (require.main === module) {
    seedDatabase();
}

module.exports = {
    generateRandomUser,
    seedDatabase,
    connectToDatabase,
    insertRandomUsers
};