export function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Returns a slug unique among Package documents. Pass excludeId when updating. */
export async function uniquePackageSlug(PackageModel, baseText, excludeId = null) {
  const base = slugify(baseText) || "package";
  let candidate = base;
  for (let n = 2; n < 1000; n += 1) {
    const existing = await PackageModel.findOne({ slug: candidate }).select("_id");
    if (!existing || (excludeId && String(existing._id) === String(excludeId))) {
      return candidate;
    }
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

export default slugify;
