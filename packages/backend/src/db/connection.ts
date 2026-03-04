import mongoose from "mongoose";

interface MongoDBConfig {
  uri: string;
  username?: string;
  password?: string;
  dbName: string;
  authSource: string;
}

function getMongoConfig(): MongoDBConfig {
  const uri = process.env.MONGODB_URI?.trim() || "mongodb://localhost:27017";
  const username = process.env.MONGODB_USERNAME?.trim();
  const password = process.env.MONGODB_PASSWORD?.trim();
  const dbName = process.env.MONGODB_DB_NAME?.trim() || "autovio";
  const authSource = process.env.MONGODB_AUTH_SOURCE?.trim() || "admin";

  return { uri, username, password, dbName, authSource };
}

function buildConnectionString(config: MongoDBConfig): string {
  const { uri, username, password, dbName, authSource } = config;

  if (uri.includes("@")) {
    return uri.includes("/") && !uri.endsWith("/") ? uri : `${uri}/${dbName}`;
  }

  if (username && password) {
    const protocol = uri.startsWith("mongodb+srv://") ? "mongodb+srv://" : "mongodb://";
    const hostPart = uri.replace(/^mongodb(\+srv)?:\/\//, "");
    return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostPart}/${dbName}?authSource=${authSource}`;
  }

  return `${uri}/${dbName}`;
}

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  const config = getMongoConfig();
  const connectionString = buildConnectionString(config);

  const sanitizedUri = connectionString.replace(/:([^:@]+)@/, ":***@");
  console.log(`[db] Connecting to MongoDB: ${sanitizedUri}`);

  try {
    await mongoose.connect(connectionString);
    isConnected = true;
    console.log("[db] Connected to MongoDB");
  } catch (error) {
    console.error("[db] MongoDB connection error:", error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("[db] Disconnected from MongoDB");
  } catch (error) {
    console.error("[db] MongoDB disconnection error:", error);
    throw error;
  }
}

export function getConnectionStatus(): boolean {
  return isConnected;
}
