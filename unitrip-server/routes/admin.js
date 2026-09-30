import { Router } from "express";
import { getAdminStats, listAuditLogs } from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", protect, requireAdmin, getAdminStats);
router.get("/logs", protect, requireAdmin, listAuditLogs);

export default router;
