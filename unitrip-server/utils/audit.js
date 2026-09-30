import AuditLog from "../models/AuditLog.js";
import logger from "./logger.js";

function actorFromReqUser(user) {
  if (!user) return { id: null, role: null, email: null };
  return {
    id: user.id || user._id?.toString() || null,
    role: user.role || null,
    email: user.email || (user.role === "admin" ? process.env.ADMIN_EMAIL || null : null),
  };
}

/**
 * Write a structured audit event to Winston + MongoDB (best-effort).
 * @param {{ level?: 'info'|'warn'|'error', action: string, message: string, meta?: object, actor?: object }} opts
 */
export async function audit(opts) {
  const level = opts.level || "info";
  const action = opts.action || "unknown";
  const message = opts.message || action;
  const meta = opts.meta || {};
  const actor = opts.actor?.id || opts.actor?.role
    ? actorFromReqUser(opts.actor)
    : opts.actor || { id: null, role: null, email: null };

  const payload = { action, ...meta, actor };

  if (level === "error") logger.error(message, payload);
  else if (level === "warn") logger.warn(message, payload);
  else logger.info(message, payload);

  try {
    await AuditLog.create({ level, action, message, meta, actor });
  } catch (err) {
    logger.error("Failed to persist audit log", {
      err: err.message,
      action,
    });
  }
}

export default audit;
