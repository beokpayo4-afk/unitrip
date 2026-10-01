import { Router } from "express";
import {
  cancelModuleBooking,
  createModuleBooking,
  getModuleBooking,
  listModuleBookings,
  updateModuleBooking,
} from "../controllers/moduleBookingController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", createModuleBooking);
router.post("/:reference/cancel", cancelModuleBooking);
router.get("/admin/all", protect, requireAdmin, listModuleBookings);
router.get("/admin/:id", protect, requireAdmin, getModuleBooking);
router.patch("/admin/:id", protect, requireAdmin, updateModuleBooking);

export default router;
