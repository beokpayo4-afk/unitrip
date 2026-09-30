import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import generateOrderId from "../utils/orderId.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  availablePaidAddOns,
  includedPlacesSnapshot,
  resolvePaidAddOns,
  sumAddOnAmount,
} from "../utils/places.js";
import {
  getRazorpay,
  razorpayConfigured,
  verifyPaymentSignature,
} from "../utils/razorpay.js";
import { upiConfigured, upiPaymentPayload, getUpiConfig } from "../utils/upi.js";
import {
  buildTicketPdfBuffer,
  generateAndStoreTicketPdf,
} from "../utils/ticketPdf.js";
import Rating from "../models/Rating.js";
import { audit } from "../utils/audit.js";
import logger from "../utils/logger.js";

function paymentReady() {
  return razorpayConfigured() || upiConfigured();
}

async function enrichTicket(booking, { userId } = {}) {
  const pending = booking.status === "pending_payment";
  const base = {
    id: booking._id,
    orderId: booking.orderId,
    status: booking.status,
    travellerName: booking.travellerName,
    email: booking.email,
    phone: booking.phone,
    travelDate: booking.travelDate,
    travellersCount: booking.travellersCount,
    totalAmount: booking.totalAmount,
    package: booking.packageSnapshot,
    includedPlaces: booking.includedPlaces || [],
    addOns: booking.addOns || [],
    ticketPdfUrl: booking.ticketPdfUrl,
    paidAt: booking.paidAt,
    paymentMethod: booking.paymentMethod || null,
    razorpayOrderId: booking.razorpayOrderId || null,
    razorpayPaymentId: booking.razorpayPaymentId || null,
    upiTxnId: booking.upiTxnId || null,
    payerUpiId: booking.payerUpiId || null,
    paymentTxnId:
      booking.razorpayPaymentId ||
      booking.upiTxnId ||
      null,
    cartGroupId: booking.cartGroupId || null,
    createdAt: booking.createdAt,
    company: {
      name: "UNITRIP TRAVELS PRIVATE LIMITED",
      location: "Delhi",
    },
    baseAmount:
      (booking.packageSnapshot?.amount || 0) * (booking.travellersCount || 1),
    addOnsAmount: sumAddOnAmount(booking.addOns || []),
    canModifyAddOns: booking.status !== "cancelled",
    paymentAvailable: paymentReady() && pending,
    upiPayment:
      upiConfigured() && pending
        ? upiPaymentPayload({
            amount: booking.totalAmount,
            note: booking.orderId,
          })
        : null,
    razorpayAvailable: razorpayConfigured() && pending,
    availableAddOns: [],
    packageUnavailable: false,
    canRate: false,
    hasRated: false,
  };

  if (userId && booking.status === "confirmed") {
    const existing = await Rating.findOne({ booking: booking._id });
    base.hasRated = Boolean(existing);
    base.canRate =
      !existing && booking.user?.toString() === String(userId);
  }

  if (booking.status === "cancelled" || !booking.packageSnapshot?.packageId) {
    return base;
  }

  const pkg = await Package.findById(booking.packageSnapshot.packageId);
  if (!pkg || pkg.deletedAt || !pkg.isActive) {
    base.packageUnavailable = true;
    base.canModifyAddOns = false;
    return base;
  }

  const already = (booking.addOns || []).map((a) => a.placeId);
  base.availableAddOns = availablePaidAddOns(pkg, already);
  return base;
}

async function findByOrderAndEmail(orderId, email) {
  if (!orderId || !email) return null;
  return Booking.findOne({
    orderId: orderId.trim().toUpperCase(),
    email: email.toLowerCase().trim(),
  });
}

async function uniqueOrderId() {
  let orderId = generateOrderId();
  for (let i = 0; i < 5; i++) {
    const exists = await Booking.findOne({ orderId });
    if (!exists) return orderId;
    orderId = generateOrderId();
  }
  return orderId;
}

async function buildBookingFromItem(userId, traveller, item, cartGroupId = null) {
  const pkg = await Package.findOne({ _id: item.packageId, isActive: true });
  if (!pkg) {
    const err = new Error(`Package not found or inactive: ${item.packageId}`);
    err.statusCode = 404;
    throw err;
  }

  const count = Math.max(1, Number(item.travellersCount) || 1);
  const travelDate = item.travelDate || traveller.travelDate;
  if (!travelDate) {
    const err = new Error("travelDate is required for each cart item");
    err.statusCode = 400;
    throw err;
  }

  const addOns = resolvePaidAddOns(pkg, item.placeIds || [], []);
  const totalAmount = pkg.amount * count + sumAddOnAmount(addOns);
  const orderId = await uniqueOrderId();

  return Booking.create({
    orderId,
    user: userId,
    packageSnapshot: {
      packageId: pkg._id,
      title: pkg.title,
      slug: pkg.slug,
      amount: pkg.amount,
      city: pkg.city,
      state: pkg.state,
      country: pkg.country,
      images: pkg.images?.slice(0, 1) || [],
    },
    travellerName: traveller.travellerName,
    email: traveller.email.toLowerCase(),
    phone: traveller.phone,
    travelDate: new Date(travelDate),
    travellersCount: count,
    status: "pending_payment",
    totalAmount,
    includedPlaces: includedPlacesSnapshot(pkg),
    addOns,
    cartGroupId,
  });
}

export const createBooking = asyncHandler(async (req, res) => {
  const {
    packageId,
    travellerName,
    email,
    phone,
    travelDate,
    travellersCount,
    placeIds,
  } = req.body;

  if (!packageId || !travellerName || !email || !phone || !travelDate) {
    return res.status(400).json({
      message:
        "packageId, travellerName, email, phone, and travelDate are required",
    });
  }

  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Admin accounts cannot create bookings" });
  }

  const booking = await buildBookingFromItem(
    req.user.id,
    { travellerName, email, phone, travelDate },
    { packageId, travellersCount, placeIds, travelDate }
  );

  await audit({
    level: "info",
    action: "booking.create",
    message: `Booking ${booking.orderId} created for "${booking.packageSnapshot?.title || "package"}"`,
    meta: {
      orderId: booking.orderId,
      bookingId: String(booking._id),
      packageId: String(booking.packageSnapshot?.packageId || ""),
      totalAmount: booking.totalAmount,
    },
    actor: req.user,
  });

  res.status(201).json({
    message: paymentReady()
      ? "Booking created. Scan the UPI QR to pay and confirm."
      : "Booking created. Payment is not configured — status is pending until admin confirms.",
    booking: await enrichTicket(booking, { userId: req.user.id }),
    razorpayEnabled: razorpayConfigured(),
    upiEnabled: upiConfigured(),
  });
});

export const checkoutCart = asyncHandler(async (req, res) => {
  const { travellerName, email, phone, travelDate, items } = req.body;

  if (!travellerName || !email || !phone || !travelDate) {
    return res.status(400).json({
      message: "travellerName, email, phone, and travelDate are required",
    });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart items are required" });
  }
  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Admin accounts cannot checkout" });
  }

  const cartGroupId = `CG-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

  const bookings = [];
  for (const item of items) {
    if (!item.packageId) {
      return res.status(400).json({ message: "Each item needs packageId" });
    }
    const booking = await buildBookingFromItem(
      req.user.id,
      { travellerName, email, phone, travelDate },
      {
        packageId: item.packageId,
        travellersCount: item.travellersCount,
        placeIds: item.placeIds,
        travelDate: item.travelDate || travelDate,
      },
      cartGroupId
    );
    bookings.push(booking);
  }

  const enriched = await Promise.all(
    bookings.map((b) => enrichTicket(b, { userId: req.user.id }))
  );
  const grandTotal = bookings.reduce((s, b) => s + b.totalAmount, 0);

  await audit({
    level: "info",
    action: "booking.cart_checkout",
    message: `Cart checkout ${cartGroupId} — ${bookings.length} booking(s), total ₹${grandTotal}`,
    meta: {
      cartGroupId,
      count: bookings.length,
      grandTotal,
      orderIds: bookings.map((b) => b.orderId),
    },
    actor: req.user,
  });

  res.status(201).json({
    message: paymentReady()
      ? "Checkout complete. Scan the UPI QR to pay and confirm all bookings."
      : "Checkout complete. Bookings are pending until payment or admin confirmation.",
    cartGroupId,
    grandTotal,
    bookings: enriched,
    razorpayEnabled: razorpayConfigured(),
    upiEnabled: upiConfigured(),
    upiPayment: upiConfigured()
      ? upiPaymentPayload({ amount: grandTotal, note: cartGroupId })
      : null,
  });
});

export const createCartPaymentOrder = asyncHandler(async (req, res) => {
  const { cartGroupId } = req.params;
  const bookings = await Booking.find({
    cartGroupId,
    user: req.user.id,
    status: "pending_payment",
  });

  if (!bookings.length) {
    return res.status(404).json({ message: "No pending bookings in this cart group" });
  }
  if (!razorpayConfigured()) {
    return res.status(503).json({
      message:
        "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    });
  }

  const grandTotal = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const amountPaise = Math.round(grandTotal * 100);
  if (amountPaise < 100) {
    return res.status(400).json({ message: "Amount too low for Razorpay" });
  }

  const rzp = getRazorpay();
  const order = await rzp.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: cartGroupId.slice(0, 40),
    notes: {
      cartGroupId,
      bookingIds: bookings.map((b) => b._id.toString()).join(","),
    },
  });

  for (const b of bookings) {
    b.razorpayOrderId = order.id;
    await b.save();
  }

  res.json({
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    cartGroupId,
    grandTotal,
    bookingIds: bookings.map((b) => b._id),
  });
});

export const verifyCartPayment = asyncHandler(async (req, res) => {
  const {
    cartGroupId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !cartGroupId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({ message: "Missing payment fields" });
  }
  if (!razorpayConfigured()) {
    return res.status(503).json({ message: "Razorpay is not configured" });
  }

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    await audit({
      level: "warn",
      action: "payment.verify_failed",
      message: `Invalid cart payment signature for ${cartGroupId}`,
      meta: { cartGroupId },
      actor: req.user,
    });
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  const bookings = await Booking.find({
    cartGroupId,
    user: req.user.id,
  });
  if (!bookings.length) {
    return res.status(404).json({ message: "Cart group not found" });
  }

  const enriched = [];
  for (const booking of bookings) {
    if (booking.status === "cancelled") continue;
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentMethod = "razorpay";
    booking.paidAt = new Date();
    booking.status = "confirmed";
    try {
      booking.ticketPdfUrl = await generateAndStoreTicketPdf(booking);
    } catch (err) {
      logger.error("PDF generation failed", { err: err.message, orderId: booking.orderId });
    }
    await booking.save();
    enriched.push(await enrichTicket(booking, { userId: req.user.id }));
  }

  await audit({
    level: "info",
    action: "payment.cart_verified",
    message: `Cart payment verified for ${cartGroupId} (${enriched.length} booking(s))`,
    meta: { cartGroupId, count: enriched.length },
    actor: req.user,
  });

  res.json({
    message: "Cart payment verified. All bookings confirmed.",
    cartGroupId,
    bookings: enriched,
  });
});

export const addBookingAddOns = asyncHandler(async (req, res) => {
  const { orderId, email, placeIds, bookingId } = req.body;

  if (!Array.isArray(placeIds) || placeIds.length === 0) {
    return res.status(400).json({ message: "placeIds array is required" });
  }

  let booking = null;

  if (bookingId && req.user) {
    booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (req.user.role !== "admin" && booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to modify this booking" });
    }
  } else if (orderId && email) {
    booking = await findByOrderAndEmail(orderId, email);
    if (!booking) {
      return res.status(404).json({
        message: "No booking found for that Order ID and email",
      });
    }
  } else {
    return res.status(400).json({
      message: "Provide bookingId (authenticated) or orderId + email",
    });
  }

  if (booking.status === "cancelled") {
    return res.status(400).json({ message: "Cannot add places to a cancelled booking" });
  }

  const pkg = await Package.findById(booking.packageSnapshot.packageId);
  if (!pkg || pkg.deletedAt || !pkg.isActive) {
    return res.status(400).json({
      message:
        "This package is no longer available for new add-ons. Your existing booking details are unchanged.",
    });
  }

  const already = (booking.addOns || []).map((a) => a.placeId);
  const newAddOns = resolvePaidAddOns(pkg, placeIds, already);

  if (newAddOns.length === 0) {
    return res.status(400).json({
      message: "No valid new paid add-on places selected",
    });
  }

  booking.addOns = [...(booking.addOns || []), ...newAddOns];
  booking.totalAmount =
    (booking.packageSnapshot.amount || 0) * booking.travellersCount +
    sumAddOnAmount(booking.addOns);

  if (booking.status === "confirmed") {
    booking.status = "pending_payment";
  }

  await booking.save();

  res.json({
    message: "Add-on places added. Total updated.",
    booking: await enrichTicket(booking, { userId: req.user?.id }),
  });
});

export const createPaymentOrder = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }
  if (booking.status === "cancelled") {
    return res.status(400).json({ message: "Booking is cancelled" });
  }
  if (booking.status === "confirmed" && booking.paidAt) {
    return res.status(400).json({ message: "Already paid" });
  }
  if (!razorpayConfigured()) {
    return res.status(503).json({
      message:
        "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    });
  }

  const rzp = getRazorpay();
  const amountPaise = Math.round(Number(booking.totalAmount) * 100);
  if (amountPaise < 100) {
    return res.status(400).json({ message: "Amount too low for Razorpay" });
  }

  const order = await rzp.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: booking.orderId.slice(0, 40),
    notes: {
      bookingId: booking._id.toString(),
      orderId: booking.orderId,
    },
  });

  booking.razorpayOrderId = order.id;
  booking.status = "pending_payment";
  await booking.save();

  res.json({
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    booking: await enrichTicket(booking, { userId: req.user.id }),
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (
    !bookingId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    return res.status(400).json({ message: "Missing payment fields" });
  }

  if (!razorpayConfigured()) {
    return res.status(503).json({ message: "Razorpay is not configured" });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    await audit({
      level: "warn",
      action: "payment.verify_failed",
      message: `Invalid payment signature for booking ${bookingId}`,
      meta: { bookingId },
      actor: req.user,
    });
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  booking.razorpayOrderId = razorpay_order_id;
  booking.razorpayPaymentId = razorpay_payment_id;
  booking.paymentMethod = "razorpay";
  booking.paidAt = new Date();
  booking.status = "confirmed";

  try {
    booking.ticketPdfUrl = await generateAndStoreTicketPdf(booking);
  } catch (err) {
    logger.error("PDF generation failed", { err: err.message, orderId: booking.orderId });
  }

  await booking.save();

  await audit({
    level: "info",
    action: "payment.verified",
    message: `Payment verified for order ${booking.orderId}`,
    meta: { orderId: booking.orderId, bookingId: String(booking._id) },
    actor: req.user,
  });

  res.json({
    message: "Payment verified. Booking confirmed.",
    booking: await enrichTicket(booking, { userId: req.user.id }),
  });
});

export const confirmUpiPayment = asyncHandler(async (req, res) => {
  if (!upiConfigured()) {
    return res.status(503).json({ message: "UPI payment is not configured" });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }
  if (booking.status === "cancelled") {
    return res.status(400).json({ message: "Booking is cancelled" });
  }
  if (booking.status === "confirmed" && booking.paidAt) {
    return res.json({
      message: "Already paid",
      booking: await enrichTicket(booking, { userId: req.user.id }),
    });
  }
  if (booking.status !== "pending_payment") {
    return res.status(400).json({ message: "Booking is not awaiting payment" });
  }

  const upiTxnId = String(req.body?.upiTxnId || "").trim().slice(0, 64);
  const payerUpiId = String(req.body?.payerUpiId || "")
    .trim()
    .toLowerCase()
    .slice(0, 80);

  if (!payerUpiId || !payerUpiId.includes("@")) {
    return res.status(400).json({
      message: "Enter your UPI ID (e.g. name@upi) used for this payment",
    });
  }

  booking.paymentMethod = "upi";
  booking.payeeUpiId = getUpiConfig()?.upiId || null;
  booking.payerUpiId = payerUpiId;
  booking.upiTxnId =
    upiTxnId || `UPI-${booking.orderId}-${Date.now().toString(36).toUpperCase()}`;
  booking.paidAt = new Date();
  booking.status = "confirmed";

  try {
    booking.ticketPdfUrl = await generateAndStoreTicketPdf(booking);
  } catch (err) {
    logger.error("PDF generation failed", { err: err.message, orderId: booking.orderId });
  }

  await booking.save();

  await audit({
    level: "info",
    action: "payment.upi_confirmed",
    message: `UPI payment confirmed for order ${booking.orderId}`,
    meta: {
      orderId: booking.orderId,
      bookingId: String(booking._id),
      upiTxnId: booking.upiTxnId,
      payerUpiId: booking.payerUpiId,
      totalAmount: booking.totalAmount,
      paidAt: booking.paidAt,
    },
    actor: req.user,
  });

  res.json({
    message: "Payment successful. Booking confirmed.",
    booking: await enrichTicket(booking, { userId: req.user.id }),
  });
});

export const confirmCartUpiPayment = asyncHandler(async (req, res) => {
  if (!upiConfigured()) {
    return res.status(503).json({ message: "UPI payment is not configured" });
  }

  const { cartGroupId } = req.params;
  const bookings = await Booking.find({
    cartGroupId,
    user: req.user.id,
    status: "pending_payment",
  });

  if (!bookings.length) {
    return res.status(404).json({
      message: "No pending bookings found for this cart",
    });
  }

  const upiTxnId = String(req.body?.upiTxnId || "").trim().slice(0, 64);
  const payerUpiId = String(req.body?.payerUpiId || "")
    .trim()
    .toLowerCase()
    .slice(0, 80);

  if (!payerUpiId || !payerUpiId.includes("@")) {
    return res.status(400).json({
      message: "Enter your UPI ID (e.g. name@upi) used for this payment",
    });
  }

  const paidAt = new Date();
  const sharedRef =
    upiTxnId ||
    `UPI-CART-${cartGroupId}-${paidAt.getTime().toString(36).toUpperCase()}`;
  const merchantUpi = getUpiConfig()?.upiId || null;
  const enriched = [];

  for (const booking of bookings) {
    booking.paymentMethod = "upi";
    booking.payeeUpiId = merchantUpi;
    booking.payerUpiId = payerUpiId;
    booking.upiTxnId = sharedRef;
    booking.paidAt = paidAt;
    booking.status = "confirmed";
    try {
      booking.ticketPdfUrl = await generateAndStoreTicketPdf(booking);
    } catch (err) {
      logger.error("PDF generation failed", {
        err: err.message,
        orderId: booking.orderId,
      });
    }
    await booking.save();
    enriched.push(await enrichTicket(booking, { userId: req.user.id }));
  }

  await audit({
    level: "info",
    action: "payment.upi_cart_confirmed",
    message: `UPI cart payment confirmed for ${cartGroupId}`,
    meta: {
      cartGroupId,
      count: bookings.length,
      orderIds: bookings.map((b) => b.orderId),
      upiTxnId: sharedRef,
      payerUpiId,
      paidAt,
    },
    actor: req.user,
  });

  res.json({
    message: "Payment successful. All cart bookings confirmed.",
    cartGroupId,
    bookings: enriched,
  });
});

export const downloadTicketPdf = asyncHandler(async (req, res) => {
  const { orderId, email } = req.query;
  const booking = await findByOrderAndEmail(orderId, email);
  if (!booking) {
    return res.status(404).json({ message: "No booking found for that Order ID and email" });
  }

  if (booking.ticketPdfUrl && booking.ticketPdfUrl.startsWith("http")) {
    return res.redirect(booking.ticketPdfUrl);
  }

  const buffer = await buildTicketPdfBuffer(booking);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${booking.orderId}.pdf"`
  );
  res.send(buffer);
});

export const regenerateTicketPdf = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  booking.ticketPdfUrl = await generateAndStoreTicketPdf(booking);
  await booking.save();

  res.json({
    message: "Ticket PDF generated",
    ticketPdfUrl: booking.ticketPdfUrl,
    booking: await enrichTicket(booking, { userId: req.user.id }),
  });
});

export const trackBooking = asyncHandler(async (req, res) => {
  const { orderId, email } = req.body;
  const booking = await findByOrderAndEmail(orderId, email);
  if (!booking) {
    return res.status(404).json({ message: "No booking found for that Order ID and email" });
  }
  res.json(await enrichTicket(booking));
});

export const getTicket = asyncHandler(async (req, res) => {
  const { orderId, email } = req.query;
  const booking = await findByOrderAndEmail(orderId, email);
  if (!booking) {
    return res.status(404).json({ message: "No booking found for that Order ID and email" });
  }
  res.json(await enrichTicket(booking));
});

export const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  const enriched = await Promise.all(
    bookings.map((b) => enrichTicket(b, { userId: req.user.id }))
  );
  res.json(enriched);
});

export const adminListBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    const q = req.query.q.trim();
    filter.$or = [
      { orderId: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { travellerName: new RegExp(q, "i") },
      { phone: new RegExp(q, "i") },
      { "packageSnapshot.title": new RegExp(q, "i") },
      { cartGroupId: new RegExp(q, "i") },
      { razorpayPaymentId: new RegExp(q, "i") },
      { upiTxnId: new RegExp(q, "i") },
      { payerUpiId: new RegExp(q, "i") },
    ];
  }
  const bookings = await Booking.find(filter).sort({ createdAt: -1 });
  const enriched = await Promise.all(bookings.map((b) => enrichTicket(b)));
  res.json(enriched);
});

export const adminUpdateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const { status } = req.body;
  const prev = booking.status;
  if (status && ["pending_payment", "confirmed", "cancelled"].includes(status)) {
    booking.status = status;
    if (status === "confirmed") {
      if (!booking.paidAt) booking.paidAt = new Date();
      if (!booking.paymentMethod) booking.paymentMethod = "admin";
      if (!booking.upiTxnId && !booking.razorpayPaymentId) {
        booking.upiTxnId = `ADMIN-${booking.orderId}-${Date.now().toString(36).toUpperCase()}`;
      }
      if (!booking.ticketPdfUrl) {
        try {
          booking.ticketPdfUrl = await generateAndStoreTicketPdf(booking);
        } catch (err) {
          logger.error("PDF generation failed", { err: err.message, orderId: booking.orderId });
        }
      }
    }
  }

  await booking.save();

  if (status && status !== prev) {
    await audit({
      level: status === "cancelled" ? "warn" : "info",
      action: "booking.status_update",
      message: `Booking ${booking.orderId} status ${prev} → ${status}`,
      meta: { orderId: booking.orderId, bookingId: String(booking._id), from: prev, to: status },
      actor: req.user,
    });
  }

  res.json(await enrichTicket(booking));
});
