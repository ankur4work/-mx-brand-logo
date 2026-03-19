import { mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import dotenv from "dotenv";

dotenv.config();

const sessionStorageMode =
  process.env.SESSION_STORAGE ||
  (process.env.NODE_ENV === "production" ? "mongodb" : "sqlite");

const sqliteSessionPath = resolve(
  process.cwd(),
  process.env.SQLITE_SESSION_DB_PATH || ".shopify/session-storage.sqlite"
);

mkdirSync(dirname(sqliteSessionPath), { recursive: true });

const sessionStorage =
  sessionStorageMode === "mongodb"
    ? new MongoDBSessionStorage(
        process.env.MONGODB_URI,
        process.env.MONGODB_DB_NAME
      )
    : sessionStorageMode === "memory"
      ? new MemorySessionStorage()
      : new SQLiteSessionStorage(sqliteSessionPath);

console.log(
  sessionStorageMode === "sqlite"
    ? `Using sqlite session storage at ${sqliteSessionPath}`
    : `Using ${sessionStorageMode} session storage`
);

const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    hostName: process.env.HOST.replace(/https?:\/\//, ""),
    scopes: process.env.SCOPES.split(","),
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage,
});

export default shopify;
