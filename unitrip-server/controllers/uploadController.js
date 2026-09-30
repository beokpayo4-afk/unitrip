import { uploadFile, cloudinaryConfigured } from "../utils/storage.js";
import asyncHandler from "../utils/asyncHandler.js";
import { audit } from "../utils/audit.js";

export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "file is required" });
  }

  const kind = req.body.kind === "pdf" ? "pdfs" : "images";
  const resourceType = kind === "pdfs" ? "raw" : "image";

  const result = await uploadFile(req.file, {
    folder: kind,
    resourceType,
  });

  await audit({
    level: "info",
    action: "upload.create",
    message: `Uploaded ${kind.slice(0, -1)}: ${req.file.originalname || "file"}`,
    meta: {
      kind,
      provider: result.provider,
      url: result.url,
      filename: req.file.originalname || null,
    },
    actor: req.user,
  });

  res.status(201).json({
    url: result.url,
    provider: result.provider,
    cloudinary: cloudinaryConfigured(),
  });
});
