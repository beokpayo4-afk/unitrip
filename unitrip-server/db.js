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

export const connectDB = async () => {
  const uri = (process.env.MONGO_URI || process.env.ATLAS_URI || "").trim();
  const target = uri ? mongoTarget(uri) : null;

  if (!uri) {
    logger.error(
      "MONGO_URI is missing. On Render, set MONGO_URI to the Atlas connection string for database unitrip."
    );
    process.exit(1);
  }

  if (target?.placeholderPassword) {
    logger.error(
      "MONGO_URI still contains <db_password>. Replace it with the real Atlas password in the Render environment variables."
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
