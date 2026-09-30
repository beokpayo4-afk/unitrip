import logger from "../utils/logger.js";

export function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  logger.error(err.message || "Unhandled error", {
    stack: err.stack,
    status,
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id || null,
  });

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `${field} already exists` });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  res.status(status).json({
    message: err.message || "Internal server error",
  });
}

export default errorHandler;
