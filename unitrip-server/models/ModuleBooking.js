import mongoose from "mongoose";

const moduleBookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ["flight", "hotel", "train", "holiday"], index: true },
    customerName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    destination: { type: String, default: "", trim: true },
    travelDate: { type: String, default: "" },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const ModuleBooking = mongoose.model("ModuleBooking", moduleBookingSchema);
export default ModuleBooking;
