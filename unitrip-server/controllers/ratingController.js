import Rating from "../models/Rating.js";
import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import asyncHandler from "../utils/asyncHandler.js";

async function refreshPackageRating(packageId) {
  const stats = await Rating.aggregate([
    { $match: { package: packageId } },
    {
      $group: {
        _id: "$package",
        averageRating: { $avg: "$stars" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]
    ? Math.round(stats[0].averageRating * 10) / 10
    : 0;
  const ratingCount = stats[0]?.ratingCount || 0;

  await Package.findByIdAndUpdate(packageId, { averageRating, ratingCount });
  return { averageRating, ratingCount };
}

export const listPackageRatings = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ package: req.params.packageId })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(ratings);
});

export const createRating = asyncHandler(async (req, res) => {
  const { bookingId, stars, comment } = req.body;

  if (!bookingId || !stars) {
    return res.status(400).json({ message: "bookingId and stars are required" });
  }

  const starValue = Number(stars);
  if (starValue < 1 || starValue > 5) {
    return res.status(400).json({ message: "stars must be between 1 and 5" });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not your booking" });
  }
  if (booking.status !== "confirmed") {
    return res.status(400).json({
      message: "You can rate only after the booking is confirmed / paid",
    });
  }

  const packageId = booking.packageSnapshot.packageId;
  if (!packageId) {
    return res.status(400).json({ message: "Package missing on booking" });
  }

  const existing = await Rating.findOne({ booking: booking._id });
  if (existing) {
    return res.status(409).json({ message: "You already rated this booking" });
  }

  const rating = await Rating.create({
    user: req.user.id,
    package: packageId,
    booking: booking._id,
    stars: starValue,
    comment: comment || "",
  });

  const stats = await refreshPackageRating(packageId).catch(() => ({
    averageRating: 0,
    ratingCount: 0,
  }));
  const populated = await Rating.findById(rating._id).populate("user", "name");

  res.status(201).json({ rating: populated, ...stats });
});
