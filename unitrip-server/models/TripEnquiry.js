import mongoose from "mongoose";

const tripEnquirySchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    destination: { type: String, required: true, trim: true },
    scope: { type: String, required: true, enum: ["domestic", "international"] },
    departureDate: { type: String, required: true },
    returnDate: { type: String, required: true },
    flexible: { type: Boolean, default: false },
    adults: { type: Number, required: true },
    children: { type: Number, required: true },
    infants: { type: Number, required: true },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    currency: { type: String, required: true },
    hotel: { type: String, required: true },
    tripTypes: [{ type: String }],
    interests: [{ type: String }],
    transport: [{ type: String }],
    requirements: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "quotation_sent", "confirmed", "cancelled", "pending_review", "in_review", "closed"],
      default: "new",
    },
    quoteIssued: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TripEnquiry = mongoose.model("TripEnquiry", tripEnquirySchema);
export default TripEnquiry;
