import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import GlobalFaq from "../models/GlobalFaq.js";
import AuditLog from "../models/AuditLog.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    packagesTotal,
    packagesActive,
    bookingsTotal,
    bookingsPending,
    bookingsConfirmed,
    bookingsCancelled,
    categoriesTotal,
    usersTotal,
    faqsTotal,
    revenueAgg,
    recentBookings,
  ] = await Promise.all([
    Package.countDocuments({ deletedAt: null }),
    Package.countDocuments({ isActive: true, deletedAt: null }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "pending_payment" }),
    Booking.countDocuments({ status: "confirmed" }),
    Booking.countDocuments({ status: "cancelled" }),
    Category.countDocuments(),
    User.countDocuments(),
    GlobalFaq.countDocuments(),
    Booking.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId travellerName email totalAmount status createdAt packageSnapshot.title"),
  ]);

  res.json({
    packages: { total: packagesTotal, active: packagesActive },
    bookings: {
      total: bookingsTotal,
      pending_payment: bookingsPending,
      confirmed: bookingsConfirmed,
      cancelled: bookingsCancelled,
    },
    categories: categoriesTotal,
    users: usersTotal,
    faqs: faqsTotal,
    revenueConfirmed: revenueAgg[0]?.total || 0,
    recentBookings: recentBookings.map((b) => ({
      id: b._id,
      orderId: b.orderId,
      travellerName: b.travellerName,
      email: b.email,
      totalAmount: b.totalAmount,
      status: b.status,
      createdAt: b.createdAt,
      packageTitle: b.packageSnapshot?.title,
    })),
  });
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.level && ["info", "warn", "error"].includes(req.query.level)) {
    filter.level = req.query.level;
  }
  if (req.query.q) {
    const q = req.query.q.trim();
    filter.$or = [
      { message: new RegExp(q, "i") },
      { action: new RegExp(q, "i") },
      { "actor.email": new RegExp(q, "i") },
    ];
  }

  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);

  res.json({
    items,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  });
});
