const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

let db;

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  db = client.db("myapp");

  console.log("MongoDB connected");
}

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Backend is working!",
    mongodb: db ? "connected" : "not connected"
  });
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a user
app.post("/users", async (req, res) => {
  try {
    const user = req.body;

    const result = await db.collection("users").insertOne(user);

    res.json({
      message: "User added",
      id: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
