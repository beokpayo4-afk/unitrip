import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "./db.js";
import logger from "./utils/logger.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import packageRoutes from "./routes/packages.js";
import faqRoutes from "./routes/faqs.js";
import bookingRoutes from "./routes/bookings.js";
import uploadRoutes from "./routes/uploads.js";
import ratingRoutes from "./routes/ratings.js";
import adminRoutes from "./routes/admin.js";
import tripEnquiryRoutes from "./routes/tripEnquiries.js";
import moduleBookingRoutes from "./routes/moduleBookings.js";
import holidayPackageRoutes from "./routes/holidayPackages.js";
import integrationRoutes from "./routes/integrations.js";
import { UPLOADS_ROOT } from "./utils/storage.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];
const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use("/uploads", express.static(UPLOADS_ROOT));

const clientDist = path.resolve(__dirname, "../unitrip-client/dist");
const clientIndex = path.join(clientDist, "index.html");
const hasClient = fs.existsSync(clientIndex);

function serverStatus(req, res) {
  res.status(200).json({
    message: "Unitrip Server is running",
    razorpay: Boolean(process.env.RAZORPAY_KEY_ID),
    cloudinary: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  });
}

app.get("/api/health", serverStatus);
if (!hasClient) app.get("/", serverStatus);
if (hasClient) app.use(express.static(clientDist));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trip-enquiries", tripEnquiryRoutes);
app.use("/api/module-bookings", moduleBookingRoutes);
app.use("/api/holiday-packages", holidayPackageRoutes);
app.use("/api/integrations", integrationRoutes);

if (hasClient) {
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    if (path.extname(req.path)) return next();
    res.sendFile(clientIndex);
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  connectDB();
  logger.info(`Server is running on port ${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`Port ${port} is already in use. Stop the other app or change PORT in .env`, {
      err: err.message,
    });
  } else {
    logger.error("Server failed to start", { err: err.message });
  }
  process.exit(1);
});

export default app;
