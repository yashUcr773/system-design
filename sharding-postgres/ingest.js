const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const API_URL = "http://api:3000/users";

async function insertUser(user) {
    await axios.post(API_URL, user);
}

async function main() {
    for (let i = 0; i < 10000; i++) {
        await insertUser({ id: uuidv4(), name: `temp_user_${i}` });
    }
}

main().catch(err => {
    console.error("Ingestion failed:", err.response?.data || err.message);
    process.exit(1);
});
