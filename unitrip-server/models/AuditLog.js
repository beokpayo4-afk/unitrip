import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error"],
      default: "info",
      index: true,
    },
    action: { type: String, required: true, trim: true, index: true },
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    actor: {
      id: { type: String, default: null },
      role: { type: String, default: null },
      email: { type: String, default: null },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
