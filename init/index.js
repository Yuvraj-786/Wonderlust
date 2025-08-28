const mongoose = require('mongoose');
const Listing = require("../models/listing");
const initdata = require("./data");

const Schema = mongoose.Schema;
const Mongo_URL = "mongodb://127.0.0.1:27017/Wonderlust";

main().then(() => {
    console.log("database connected.");
}).catch((err) => {
    console.error(err, "someting wrong.");
});

async function main() {
    await mongoose.connect(Mongo_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({...obj, owner: '68a8a05f2d7f945a94d2d8c5'}));
    await Listing.insertMany(initdata.data); 
}

initDB();