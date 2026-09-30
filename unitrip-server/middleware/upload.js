import multer from "multer";
import path from "path";
import { UPLOADS_ROOT } from "../utils/storage.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(UPLOADS_ROOT, "tmp"));
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.-]+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

import fs from "fs";
const tmp = path.join(UPLOADS_ROOT, "tmp");
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});

export default upload;
