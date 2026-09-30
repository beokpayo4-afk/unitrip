import { Router } from "express";
import { uploadMedia } from "../controllers/uploadController.js";
import { upload } from "../middleware/upload.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, requireAdmin, upload.single("file"), uploadMedia);

export default router;
