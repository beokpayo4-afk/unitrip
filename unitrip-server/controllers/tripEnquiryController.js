import crypto from "crypto";
import TripEnquiry from "../models/TripEnquiry.js";
import asyncHandler from "../utils/asyncHandler.js";
import { audit } from "../utils/audit.js";

const SCOPES = ["domestic", "international"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "THB"];
const HOTELS = ["3-star", "4-star", "5-star", "luxury"];
const TRIP_TYPES = ["Honeymoon", "Family", "Adventure", "Solo", "Friends", "Corporate", "Religious", "Leisure"];
const INTERESTS = ["Sightseeing", "Beaches", "Mountains", "Shopping", "Adventure", "Wildlife", "Nightlife", "Food", "Culture"];
const TRANSPORT = ["Flight", "Train", "Bus", "Private Cab", "Airport Transfer"];
const STATUSES = ["new", "contacted", "quotation_sent", "confirmed", "cancelled"];
const LEGACY_STATUS = {
  pending_review: "new",
  in_review: "contacted",
  closed: "cancelled",
};

function reference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(6);
  let body = "";
  for (const value of bytes) body += alphabet[value % alphabet.length];
  return `TQ${body}`;
}

function cleanList(values, allowed) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((item) => String(item)))].filter((item) => allowed.includes(item));
}

function todayISO() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function validateTripEnquiry(body) {
  const errors = {};
  const destination = String(body.destination || "").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9\s,'-]{1,79}$/.test(destination)) {
    errors.destination = "Enter a destination.";
  }
  if (!SCOPES.includes(body.scope)) errors.scope = "Choose domestic or international.";

  const departure = String(body.departureDate || "");
  const returning = String(body.returnDate || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departure)) errors.departureDate = "Choose a departure date.";
  else if (departure < todayISO()) errors.departureDate = "Departure cannot be in the past.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(returning)) errors.returnDate = "Choose a return date.";
  else if (departure && returning <= departure) errors.returnDate = "Return must be after departure.";

  const adults = Number(body.adults);
  const children = Number(body.children);
  const infants = Number(body.infants);
  if (!Number.isInteger(adults) || adults < 1 || adults > 12) errors.adults = "Add 1 to 12 adults.";
  if (!Number.isInteger(children) || children < 0 || children > 8) errors.children = "Children must be between 0 and 8.";
  if (!Number.isInteger(infants) || infants < 0 || infants > 6) errors.infants = "Infants must be between 0 and 6.";
  else if (Number.isInteger(adults) && infants > adults) errors.infants = "Each infant needs an adult.";

  const budgetMin = Number(body.budgetMin);
  const budgetMax = Number(body.budgetMax);
  if (!Number.isFinite(budgetMin) || budgetMin < 1) errors.budgetMin = "Enter a minimum budget.";
  if (!Number.isFinite(budgetMax) || budgetMax < 1) errors.budgetMax = "Enter a maximum budget.";
  else if (Number.isFinite(budgetMin) && budgetMax < budgetMin) {
    errors.budgetMax = "Maximum budget must be at least the minimum.";
  }
  if (!CURRENCIES.includes(body.currency)) errors.currency = "Choose a currency.";
  if (!HOTELS.includes(body.hotel)) errors.hotel = "Choose a hotel preference.";

  const tripTypes = cleanList(body.tripTypes, TRIP_TYPES);
  const interests = cleanList(body.interests, INTERESTS);
  const transport = cleanList(body.transport, TRANSPORT);
  if (tripTypes.length === 0) errors.tripTypes = "Choose at least one trip type.";
  if (interests.length === 0) errors.interests = "Choose at least one interest.";
  if (transport.length === 0) errors.transport = "Choose at least one transport option.";

  const requirements = String(body.requirements || "").trim();
  if (requirements.length > 2000) errors.requirements = "Keep special requirements under 2000 characters.";

  const name = String(body.name || "").trim();
  if (!/^[A-Za-z][A-Za-z\s'-]{1,79}$/.test(name)) errors.name = "Enter the full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email || "").trim())) errors.email = "Enter a valid email.";
  const phone = String(body.phone || "").replace(/\s/g, "");
  const whatsapp = String(body.whatsapp || "").replace(/\s/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(phone)) errors.phone = "Enter a valid phone number.";
  if (!/^\+?[0-9]{8,15}$/.test(whatsapp)) errors.whatsapp = "Enter a valid WhatsApp number.";

  return {
    errors,
    value: {
      destination,
      scope: body.scope,
      departureDate: departure,
      returnDate: returning,
      flexible: Boolean(body.flexible),
      adults,
      children,
      infants,
      budgetMin,
      budgetMax,
      currency: body.currency,
      hotel: body.hotel,
      tripTypes,
      interests,
      transport,
      requirements,
      name,
      email: String(body.email || "").trim().toLowerCase(),
      phone,
      whatsapp,
    },
  };
}

export const createTripEnquiry = asyncHandler(async (req, res) => {
  const { errors, value } = validateTripEnquiry(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Check the trip request and try again.", errors });
  }

  const enquiry = await TripEnquiry.create({
    ...value,
    reference: reference(),
    status: "new",
    quoteIssued: false,
  });

  await audit({
    level: "info",
    action: "tripEnquiry.create",
    message: `Custom trip request ${enquiry.reference}`,
    meta: { reference: enquiry.reference, destination: enquiry.destination },
    actor: req.user,
  });

  res.status(201).json({
    reference: enquiry.reference,
    status: enquiry.status,
    quoteIssued: false,
    message: "A UnitTrip travel expert will review this request. A quote has not been prepared.",
    enquiry: value,
  });
});

function presentEnquiry(enquiry) {
  const plain = enquiry.toObject();
  plain.status = LEGACY_STATUS[plain.status] || plain.status;
  return plain;
}

export const listTripEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await TripEnquiry.find().sort({ createdAt: -1 }).limit(200);
  res.json(enquiries.map(presentEnquiry));
});

export const getTripEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await TripEnquiry.findById(req.params.id);
  if (!enquiry) return res.status(404).json({ message: "Request not found" });
  res.json(presentEnquiry(enquiry));
});

export const updateTripEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await TripEnquiry.findById(req.params.id);
  if (!enquiry) return res.status(404).json({ message: "Request not found" });
  if (!STATUSES.includes(req.body?.status)) {
    return res.status(400).json({ message: "Choose a valid status." });
  }
  enquiry.status = req.body.status;
  enquiry.quoteIssued = req.body.status === "quotation_sent";
  await enquiry.save();
  res.json(presentEnquiry(enquiry));
});
