// Load env
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const initData = require("./data");

async function main() {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("✅ Database connected");

    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);

    console.log("✅ Data seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
}

main();
