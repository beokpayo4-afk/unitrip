import { Router } from "express";
import { createTripEnquiry, getTripEnquiry, listTripEnquiries, updateTripEnquiry } from "../controllers/tripEnquiryController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", createTripEnquiry);
router.get("/admin/all", protect, requireAdmin, listTripEnquiries);
router.get("/admin/:id", protect, requireAdmin, getTripEnquiry);
router.patch("/admin/:id", protect, requireAdmin, updateTripEnquiry);

export default router;
