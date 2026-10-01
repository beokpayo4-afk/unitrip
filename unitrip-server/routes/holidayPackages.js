import { Router } from "express";
import {
  adminGetHolidayPackage,
  adminListHolidayPackages,
  createHolidayPackage,
  deleteHolidayPackage,
  getPublishedHolidayPackage,
  listPublishedHolidayPackages,
  seedHolidayPackages,
  setHolidayPackagePublished,
  updateHolidayPackage,
} from "../controllers/holidayPackageController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", listPublishedHolidayPackages);
router.get("/slug/:slug", getPublishedHolidayPackage);
router.get("/admin/all", protect, requireAdmin, adminListHolidayPackages);
router.post("/admin/seed", protect, requireAdmin, seedHolidayPackages);
router.get("/admin/:id", protect, requireAdmin, adminGetHolidayPackage);
router.post("/", protect, requireAdmin, createHolidayPackage);
router.put("/:id", protect, requireAdmin, updateHolidayPackage);
router.patch("/:id/published", protect, requireAdmin, setHolidayPackagePublished);
router.delete("/:id", protect, requireAdmin, deleteHolidayPackage);

export default router;
