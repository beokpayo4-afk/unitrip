import ModuleBooking from "../models/ModuleBooking.js";
import asyncHandler from "../utils/asyncHandler.js";
import { audit } from "../utils/audit.js";

const TYPES = ["flight", "hotel", "train", "holiday"];
const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

function clean(body) {
  const type = body.type;
  const reference = String(body.reference || "").trim().toUpperCase();
  const amount = Number(body.amount);
  return {
    type,
    reference,
    customerName: String(body.customerName || "").trim().slice(0, 120),
    email: String(body.email || "").trim().toLowerCase().slice(0, 160),
    phone: String(body.phone || "").trim().slice(0, 20),
    destination: String(body.destination || "").trim().slice(0, 120),
    travelDate: String(body.travelDate || "").slice(0, 40),
    amount: Number.isFinite(amount) && amount >= 0 ? amount : 0,
    currency: String(body.currency || "INR").slice(0, 8),
    details: body.details && typeof body.details === "object" ? body.details : {},
  };
}

export const createModuleBooking = asyncHandler(async (req, res) => {
  const value = clean(req.body || {});
  if (!TYPES.includes(value.type)) return res.status(400).json({ message: "Unknown booking type." });
  if (!/^[A-Z0-9]{6,16}$/.test(value.reference)) {
    return res.status(400).json({ message: "Booking reference is missing." });
  }
  const existing = await ModuleBooking.findOne({ reference: value.reference });
  if (existing) return res.status(200).json(existing);
  const booking = await ModuleBooking.create({ ...value, status: "pending" });
  await audit({
    level: "info",
    action: "moduleBooking.create",
    message: `${value.type} booking ${value.reference}`,
    meta: { reference: value.reference, type: value.type },
    actor: req.user,
  });
  res.status(201).json(booking);
});

export const listModuleBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.type) {
    if (!TYPES.includes(req.query.type)) return res.status(400).json({ message: "Unknown booking type." });
    filter.type = req.query.type;
  }
  if (req.query.status && STATUSES.includes(req.query.status)) filter.status = req.query.status;
  const bookings = await ModuleBooking.find(filter).sort({ createdAt: -1 }).limit(200);
  res.json(bookings);
});

export const getModuleBooking = asyncHandler(async (req, res) => {
  const booking = mongooseId(req.params.id)
    ? await ModuleBooking.findById(req.params.id)
    : await ModuleBooking.findOne({ reference: req.params.id });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

export const updateModuleBooking = asyncHandler(async (req, res) => {
  const booking = await ModuleBooking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (!STATUSES.includes(req.body?.status)) return res.status(400).json({ message: "Choose a valid status." });
  booking.status = req.body.status;
  await booking.save();
  await audit({
    level: "info",
    action: "moduleBooking.status",
    message: `${booking.reference} set to ${booking.status}`,
    meta: { reference: booking.reference, status: booking.status },
    actor: req.user,
  });
  res.json(booking);
});

function mongooseId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || ""));
}
