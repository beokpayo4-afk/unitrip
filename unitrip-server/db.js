import mongoose from "mongoose";
import logger from "./utils/logger.js";

function mongoTarget(uri) {
  try {
    const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, "https://"));
    return {
      user: decodeURIComponent(parsed.username || ""),
      host: parsed.hostname,
      db: parsed.pathname.replace(/^\//, "") || "(default)",
      placeholderPassword:
        parsed.password === "<db_password>" ||
        decodeURIComponent(parsed.password || "") === "<db_password>",
    };
  } catch {
    return null;
  }
}

function resolveMongoUri() {
  let uri = (process.env.MONGO_URI || process.env.ATLAS_URI || "").trim();
  const password = (process.env.MONGO_PASSWORD || "").trim();
  if (uri.includes("<db_password>") && password) {
    uri = uri.replaceAll("<db_password>", encodeURIComponent(password));
  }
  return uri;
}

export const connectDB = async () => {
  const uri = resolveMongoUri();
  const target = uri ? mongoTarget(uri) : null;

  if (!uri) {
    logger.error(
      "MONGO_URI is missing. On Render, set MONGO_URI to the Atlas connection string for database unitrip."
    );
    process.exit(1);
  }

  if (target?.placeholderPassword) {
    logger.error(
      "MONGO_URI still contains <db_password>. In Render → Environment, replace <db_password> with the Atlas password, or add MONGO_PASSWORD. Do not commit the password; this GitHub repo is public."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    logger.info("Connected to MongoDB", {
      host: target?.host,
      db: target?.db,
      user: target?.user,
    });
  } catch (error) {
    const authFailed = /bad auth|authentication failed/i.test(error.message || "");
    logger.error(
      authFailed
        ? `MongoDB rejected user "${target?.user || "unknown"}" on ${target?.host || "Atlas"}. Update MONGO_URI in Render with the Atlas password. The local .env file is not deployed.`
        : "MongoDB connection failed",
      { err: error.message, stack: error.stack }
    );
    process.exit(1);
  }
};

export default connectDB;
