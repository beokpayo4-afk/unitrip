import { Router } from "express";
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", listCategories);
router.get("/:idOrSlug", getCategory);

router.post("/", protect, requireAdmin, createCategory);
router.put("/:id", protect, requireAdmin, updateCategory);
router.delete("/:id", protect, requireAdmin, deleteCategory);

export default router;
