import mongoose from "mongoose";

const daySchema = new mongoose.Schema(
  { day: Number, title: String, description: String },
  { _id: false }
);

const holidayPackageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    country: { type: String, default: "India", trim: true },
    scope: { type: String, enum: ["domestic", "international"], required: true },
    categories: [{ type: String }],
    durationNights: { type: Number, default: 1 },
    durationLabel: { type: String, default: "" },
    startingPrice: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: null },
    reviewCount: { type: Number, default: 0 },
    hotelCategory: { type: String, default: "" },
    summary: { type: String, default: "" },
    overview: { type: String, default: "" },
    images: [{ type: String }],
    itinerary: [daySchema],
    hotels: [{ name: String, category: String, nights: Number }],
    meals: { type: String, default: "" },
    transportation: { type: String, default: "" },
    activities: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    cancellation: [{ type: String }],
    terms: [{ type: String }],
    faqs: [{ question: String, answer: String }],
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const HolidayPackage = mongoose.model("HolidayPackage", holidayPackageSchema);
export default HolidayPackage;
