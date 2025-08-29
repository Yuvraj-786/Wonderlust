const mongoose = require("mongoose");
require("dotenv").config();

async function test() {
  try {
    await mongoose.connect(process.env.ATLASDB_URL, {
      ssl: true,
      tls: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB Atlas!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  }
}

test();
