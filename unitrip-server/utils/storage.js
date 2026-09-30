import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

const folders = ["images", "pdfs", "tickets"];
for (const folder of folders) {
  const dir = path.join(UPLOADS_ROOT, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

if (cloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function publicUrl(relativePath) {
  const base = process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${base}/uploads/${relativePath.replace(/\\/g, "/")}`;
}

/**
 * Upload a multer file (disk or memory). Returns permanent URL.
 * Uses Cloudinary when configured; otherwise local /uploads.
 */
export async function uploadFile(file, { folder = "images", resourceType = "auto" } = {}) {
  if (!file) throw Object.assign(new Error("No file provided"), { statusCode: 400 });

  if (cloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(
      file.path || `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: `unitrip/${folder}`,
        resource_type: resourceType,
      }
    );
    if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return { url: result.secure_url, publicId: result.public_id, provider: "cloudinary" };
  }

  const destDir = path.join(UPLOADS_ROOT, folder);
  const safeName = `${Date.now()}-${(file.originalname || "file").replace(/[^\w.-]+/g, "_")}`;
  const dest = path.join(destDir, safeName);

  if (file.path) {
    fs.renameSync(file.path, dest);
  } else if (file.buffer) {
    fs.writeFileSync(dest, file.buffer);
  } else {
    throw Object.assign(new Error("Invalid upload"), { statusCode: 400 });
  }

  return {
    url: publicUrl(`${folder}/${safeName}`),
    publicId: null,
    provider: "local",
  };
}

export async function uploadBuffer(buffer, { folder = "tickets", filename, mimeType = "application/pdf" }) {
  if (cloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${buffer.toString("base64")}`,
      {
        folder: `unitrip/${folder}`,
        resource_type: "raw",
        public_id: filename?.replace(/\.pdf$/i, ""),
      }
    );
    return { url: result.secure_url, provider: "cloudinary" };
  }

  const safeName = filename || `${Date.now()}.pdf`;
  const dest = path.join(UPLOADS_ROOT, folder, safeName);
  fs.writeFileSync(dest, buffer);
  return { url: publicUrl(`${folder}/${safeName}`), provider: "local" };
}

export default { uploadFile, uploadBuffer, cloudinaryConfigured };
