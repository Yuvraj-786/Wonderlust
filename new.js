require('dotenv').config({ debug: true });

console.log('ATLASDB_URL:', process.env.ATLASDB_URL.replace(/:\/\/.*@/, '://<hidden>@'));

const MongoStore = require("connect-mongo");

async function testMongoStore() {
  const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
      secret: "password",
    },
    touchAfter: 24 * 3600,
    clientOptions: {
      ssl: true,
      minTLSVersion: 'TLSv1.2',
      tlsAllowInvalidCertificates: true, // Insecure, for debugging only
    },
  });

  store.on("error", (err) => {
    console.log("MongoStore error:", err);
  });

  await new Promise((resolve, reject) => {
    store.on("connected", () => {
      console.log("MongoStore connected");
      resolve();
    });
    store.on("error", reject);
  });
}

testMongoStore().catch(console.error);