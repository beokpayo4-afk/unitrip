import { Router } from "express";
import {
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../controllers/faqController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", listFaqs);
router.post("/", protect, requireAdmin, createFaq);
router.put("/:id", protect, requireAdmin, updateFaq);
router.delete("/:id", protect, requireAdmin, deleteFaq);

export default router;
