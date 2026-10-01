import HolidayPackage from "../models/HolidayPackage.js";
import asyncHandler from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";
import { audit } from "../utils/audit.js";

const SCOPES = ["domestic", "international"];

function lines(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanPackage(body) {
  const name = String(body.name || "").trim();
  const slug = slugify(body.slug || name);
  const itinerary = Array.isArray(body.itinerary)
    ? body.itinerary
        .map((day, index) => ({
          day: Number(day.day) || index + 1,
          title: String(day.title || "").trim(),
          description: String(day.description || "").trim(),
        }))
        .filter((day) => day.title || day.description)
    : [];
  return {
    slug,
    name,
    destination: String(body.destination || "").trim(),
    country: String(body.country || "India").trim(),
    scope: body.scope,
    categories: lines(body.categories),
    durationNights: Number(body.durationNights) || 1,
    durationLabel: String(body.durationLabel || "").trim(),
    startingPrice: Number(body.startingPrice),
    rating: body.rating == null || body.rating === "" ? null : Number(body.rating),
    reviewCount: Number(body.reviewCount) || 0,
    hotelCategory: String(body.hotelCategory || "").trim(),
    summary: String(body.summary || "").trim(),
    overview: String(body.overview || "").trim(),
    images: lines(body.images),
    itinerary,
    hotels: Array.isArray(body.hotels) ? body.hotels : [],
    meals: String(body.meals || "").trim(),
    transportation: String(body.transportation || "").trim(),
    activities: lines(body.activities),
    inclusions: lines(body.inclusions),
    exclusions: lines(body.exclusions),
    cancellation: lines(body.cancellation),
    terms: lines(body.terms),
    faqs: Array.isArray(body.faqs) ? body.faqs.filter((item) => item.question && item.answer) : [],
    published: Boolean(body.published),
  };
}

function invalid(value) {
  if (!value.name || !value.destination) return "Name and destination are required.";
  if (!SCOPES.includes(value.scope)) return "Choose domestic or international.";
  if (!Number.isFinite(value.startingPrice) || value.startingPrice < 0) return "Enter a starting price.";
  if (!value.slug) return "Enter a package name.";
  return "";
}

export const listPublishedHolidayPackages = asyncHandler(async (req, res) => {
  const count = await HolidayPackage.countDocuments();
  const packages = await HolidayPackage.find({ published: true }).sort({ name: 1 });
  res.json({ managed: count > 0, packages });
});

export const getPublishedHolidayPackage = asyncHandler(async (req, res) => {
  const count = await HolidayPackage.countDocuments();
  const item = await HolidayPackage.findOne({ slug: req.params.slug, published: true });
  if (!item) return res.status(404).json({ message: "Package not found", managed: count > 0 });
  res.json(item);
});

export const adminListHolidayPackages = asyncHandler(async (req, res) => {
  const packages = await HolidayPackage.find().sort({ updatedAt: -1 });
  res.json(packages);
});

export const adminGetHolidayPackage = asyncHandler(async (req, res) => {
  const item = await HolidayPackage.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Package not found" });
  res.json(item);
});

export const createHolidayPackage = asyncHandler(async (req, res) => {
  const value = cleanPackage(req.body || {});
  const message = invalid(value);
  if (message) return res.status(400).json({ message });
  const exists = await HolidayPackage.findOne({ slug: value.slug });
  if (exists) return res.status(409).json({ message: "A package with this name already exists." });
  const item = await HolidayPackage.create(value);
  await audit({
    level: "info",
    action: "holidayPackage.create",
    message: `Holiday package created: ${item.name}`,
    meta: { id: String(item._id), slug: item.slug },
    actor: req.user,
  });
  res.status(201).json(item);
});

export const updateHolidayPackage = asyncHandler(async (req, res) => {
  const item = await HolidayPackage.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Package not found" });
  const value = cleanPackage({ ...item.toObject(), ...req.body, slug: req.body.slug || item.slug });
  const message = invalid(value);
  if (message) return res.status(400).json({ message });
  const clash = await HolidayPackage.findOne({ slug: value.slug, _id: { $ne: item._id } });
  if (clash) return res.status(409).json({ message: "A package with this name already exists." });
  Object.assign(item, value);
  await item.save();
  res.json(item);
});

export const deleteHolidayPackage = asyncHandler(async (req, res) => {
  const item = await HolidayPackage.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Package not found" });
  res.json({ message: "Package deleted" });
});

export const setHolidayPackagePublished = asyncHandler(async (req, res) => {
  const item = await HolidayPackage.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Package not found" });
  item.published = Boolean(req.body?.published);
  await item.save();
  res.json(item);
});

export const seedHolidayPackages = asyncHandler(async (req, res) => {
  const count = await HolidayPackage.countDocuments();
  if (count > 0) {
    const packages = await HolidayPackage.find().sort({ name: 1 });
    return res.json(packages);
  }
  const incoming = Array.isArray(req.body?.packages) ? req.body.packages : [];
  if (incoming.length === 0) return res.json([]);
  const docs = incoming.map((item) => cleanPackage({ ...item, published: true }));
  const bad = docs.find((item) => invalid(item));
  if (bad) return res.status(400).json({ message: invalid(bad) });
  await HolidayPackage.insertMany(docs);
  const packages = await HolidayPackage.find().sort({ name: 1 });
  res.status(201).json(packages);
});
