import logger from "../utils/logger.js";

/** Log each HTTP request with status and duration */
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const userId = req.user?.id || null;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`;
    const meta = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      userId,
    };
    if (res.statusCode >= 500) logger.error(line, meta);
    else if (res.statusCode >= 400) logger.warn(line, meta);
    else logger.info(line, meta);
  });
  next();
}

export default requestLogger;
