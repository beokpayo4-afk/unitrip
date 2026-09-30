import mongoose from "mongoose";

/** Phase 2 place shape — reserved on package documents in Phase 1 */
const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    distanceKm: { type: Number, default: 0 },
    extraAmount: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["included", "paid_addon"],
      default: "included",
    },
  },
  { _id: true }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: true }
);

const pdfLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: true }
);

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: String, trim: true }],
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "India" },
    images: [{ type: String }],
    amount: { type: Number, required: true, min: 0 },
    about: { type: String, default: "" },
    highlights: [{ type: String }],
    itinerary: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    pdfLinks: [pdfLinkSchema],
    faqs: [faqSchema],
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    // Phase 2: per-package included vs paid_addon places (distance + extra cost)
    places: { type: [placeSchema], default: [] },
  },
  { timestamps: true }
);

packageSchema.index({ city: 1, isActive: 1 });
packageSchema.index({ tags: 1 });

const Package = mongoose.model("Package", packageSchema);
export default Package;
