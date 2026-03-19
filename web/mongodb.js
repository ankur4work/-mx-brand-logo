import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const collectionName = "shopify_sessions";

let client;

export const connectToMongoDB = async () => {
  if (!uri || !dbName) {
    throw new Error("Missing MONGODB_URI or MONGODB_DB_NAME");
  }

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB for session storage");
  }
  return client.db(dbName).collection(collectionName);
};
