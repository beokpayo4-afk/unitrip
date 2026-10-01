import { Router } from "express";
import {
  listPackages,
  listDestinations,
  listPlacesByCity,
  getPackageBySlug,
  adminListPackages,
  adminGetPackage,
  createPackage,
  updatePackage,
  setPackageVisibility,
  deletePackage,
} from "../controllers/packageController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/meta/destinations", listDestinations);
router.get("/meta/places", listPlacesByCity);
router.get("/", listPackages);
router.get("/slug/:slug", getPackageBySlug);

router.get("/admin/all", protect, requireAdmin, adminListPackages);
router.get("/admin/:id", protect, requireAdmin, adminGetPackage);
router.post("/", protect, requireAdmin, createPackage);
router.put("/:id", protect, requireAdmin, updatePackage);
router.patch("/:id/visibility", protect, requireAdmin, setPackageVisibility);
router.delete("/:id", protect, requireAdmin, deletePackage);

export default router;
