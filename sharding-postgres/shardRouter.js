const { Pool } = require("pg");
const crypto = require("crypto");

const SHARD_COUNT = parseInt(process.env.SHARD_COUNT || "3");

const shards = [];

for (let i = 1; i <= SHARD_COUNT; i++) {
    shards.push(
        new Pool({
            host: `sharding-postgres-shard-${i}`,
            user: "postgres",
            password: "password",
            database: "shard"
        })
    );
}

/**
 * Hash a UUID into a shard number
 * @param {string} uuid - UUID v4
 * @param {number} shardCount - total number of shards
 * @returns {number} shard index (0-based)
 */
function getShard(uuid, shardCount) {
    const hash = crypto.createHash("sha256").update(uuid).digest();

    // Read first 4 bytes as unsigned 32-bit int
    const hashInt = hash.readUInt32BE(0);

    return shards[hashInt % shards.length];

}


async function initializeShards() {
    for (let i = 0; i < shards.length; i++) {
        await shards[i].query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);

        console.log(`Shard ${i + 1} ready`);
    }
}

module.exports = { getShard, initializeShards };
