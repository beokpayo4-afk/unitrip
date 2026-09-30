import { Router } from "express";
import {
  listPackageRatings,
  createRating,
} from "../controllers/ratingController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/package/:packageId", listPackageRatings);
router.post("/", protect, createRating);

export default router;
