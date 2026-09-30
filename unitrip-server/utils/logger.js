import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import winston from "winston";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, "..", "logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const body = stack || message;
  return `${ts} [${level}] ${body}${rest}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "unitrip-server" },
  format: combine(errors({ stack: true }), timestamp()),
  transports: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level: "error",
      format: combine(timestamp(), json()),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(LOG_DIR, "combined.log"),
      format: combine(timestamp(), json()),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), consoleFormat),
    }),
  ],
});

export default logger;
