import Category from "../models/Category.js";
import Package from "../models/Package.js";
import slugify from "../utils/slugify.js";
import asyncHandler from "../utils/asyncHandler.js";
import { audit } from "../utils/audit.js";

const HIDDEN_CATEGORY_SLUGS = new Set([
  "air-tours",
  "luxury-rail",
  "water-sports",
  "car-charters",
  "attractions-tickets",
]);

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  const visible =
    req.query.all === "1"
      ? categories
      : categories.filter((category) => !HIDDEN_CATEGORY_SLUGS.has(category.slug));
  res.json(visible);
});

export const getCategory = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  let found = await Category.findOne({ slug: idOrSlug });
  if (!found) {
    found = await Category.findById(idOrSlug).catch(() => null);
  }
  if (!found) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(found);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, imageUrl, slug } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const category = await Category.create({
    name,
    slug: slug || slugify(name),
    description: description || "",
    imageUrl: imageUrl || "",
  });

  await audit({
    level: "info",
    action: "category.create",
    message: `Category created: "${category.name}"`,
    meta: { categoryId: String(category._id), slug: category.slug },
    actor: req.user,
  });

  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const { name, description, imageUrl, slug } = req.body;
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (imageUrl !== undefined) category.imageUrl = imageUrl;
  if (slug !== undefined) category.slug = slug;
  else if (name) category.slug = slugify(name);

  await category.save();

  await audit({
    level: "info",
    action: "category.update",
    message: `Category updated: "${category.name}"`,
    meta: { categoryId: String(category._id), slug: category.slug },
    actor: req.user,
  });

  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const inUse = await Package.countDocuments({ category: category._id });
  if (inUse > 0) {
    await audit({
      level: "warn",
      action: "category.delete_blocked",
      message: `Cannot delete category "${category.name}" — ${inUse} package(s) use it`,
      meta: { categoryId: String(category._id), inUse },
      actor: req.user,
    });
    return res.status(400).json({
      message: `Cannot delete: ${inUse} package(s) use this category`,
    });
  }

  const name = category.name;
  const id = String(category._id);
  await category.deleteOne();

  await audit({
    level: "warn",
    action: "category.delete",
    message: `Category deleted: "${name}"`,
    meta: { categoryId: id },
    actor: req.user,
  });

  res.json({ message: "Category deleted" });
});
