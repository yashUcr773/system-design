const express = require("express");
const { getShard, initializeShards } = require("./shardRouter");

const app = express();
app.use(express.json());

async function startServer() {
    // Ensure all shards are ready
    await initializeShards();

    app.post("/users", async (req, res) => {
        const { id, name } = req.body;
        const shard = getShard(id);

        await shard.query(
            "INSERT INTO users (id, name) VALUES ($1, $2)",
            [id, name]
        );

        res.send({ message: "User inserted", shard: id % 3 });
    });

    app.get("/users/:id", async (req, res) => {
        const id = parseInt(req.params.id);
        const shard = getShard(id);

        const result = await shard.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        res.send(result.rows[0]);
    });

    app.listen(3000, () => {
        console.log("🚀 API running on http://localhost:3000");
    });
}

startServer().catch(err => {
    console.error("Startup failed:", err);
    process.exit(1);
});
