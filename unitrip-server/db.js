import dns from "dns";
import mongoose from "mongoose";
import logger from "./utils/logger.js";

/** Password text between the first userinfo colon and @, before URL decoding. */
function rawPassword(uri) {
  const withoutScheme = uri.replace(/^mongodb(?:\+srv)?:\/\//i, "");
  const at = withoutScheme.indexOf("@");
  if (at === -1) return "";
  const userinfo = withoutScheme.slice(0, at);
  const colon = userinfo.indexOf(":");
  if (colon === -1) return "";
  return userinfo.slice(colon + 1);
}

function mongoTarget(uri) {
  try {
    const parsed = new URL(uri.replace(/^mongodb(\+srv)?:\/\//, "https://"));
    return {
      user: decodeURIComponent(parsed.username || ""),
      host: parsed.hostname,
      db: parsed.pathname.replace(/^\//, "") || "(default)",
      // Compare the raw password only. URL parsing percent-encodes "<", so a
      // real password of "<db_password>" (%3Cdb_password%3E) is not the template token.
      placeholderPassword: rawPassword(uri) === "<db_password>",
    };
  } catch {
    return null;
  }
}

function logConnectionError(error, target) {
  const authFailed = /bad auth|authentication failed/i.test(error.message || "");
  logger.error(
    authFailed
      ? `MongoDB rejected user "${target?.user || "unknown"}" on ${target?.host || "Atlas"}. Update MONGO_URI in Render with the Atlas password. The local .env file is not deployed.`
      : "MongoDB connection failed",
    { err: error.message, stack: error.stack }
  );
  process.exit(1);
}

function resolveMongoUri() {
  let uri = (process.env.MONGO_URI || process.env.ATLAS_URI || "").trim();
  const password = (process.env.MONGO_PASSWORD || "").trim();
  if (password && rawPassword(uri) === "<db_password>") {
    uri = uri.replace(
      /^(mongodb(?:\+srv)?:\/\/[^:/?#]*:)<db_password>(@)/i,
      `$1${encodeURIComponent(password)}$2`
    );
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

  if (!target) {
    logger.error("MONGO_URI is not a valid MongoDB connection string.");
    process.exit(1);
  }

  if (target.placeholderPassword) {
    logger.error(
      "MONGO_URI still contains <db_password>. In Render → Environment, replace <db_password> with the Atlas password, or add MONGO_PASSWORD. Do not commit the password; this GitHub repo is public."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
  } catch (error) {
    const dnsFailed = /querySrv|queryTxt|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEOUT/i.test(
      error.message || ""
    );
    if (!dnsFailed) {
      logConnectionError(error, target);
      return;
    }

    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    try {
      await mongoose.connect(uri);
    } catch (retryError) {
      logger.error(
        "MongoDB connection failed after retrying with public DNS (8.8.8.8, 1.1.1.1).",
        {
          err: retryError.message,
          stack: retryError.stack,
          firstError: error.message,
        }
      );
      process.exit(1);
    }
  }

  logger.info("Connected to MongoDB", {
    host: target.host,
    db: target.db,
    user: target.user,
  });
};

export default connectDB;
