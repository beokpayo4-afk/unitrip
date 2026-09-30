import mongoose from "mongoose";

const packageSnapshotSchema = new mongoose.Schema(
  {
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    title: String,
    slug: String,
    amount: Number,
    city: String,
    state: String,
    country: String,
    images: [String],
  },
  { _id: false }
);

/** Selected paid add-on places */
const addOnSchema = new mongoose.Schema(
  {
    placeId: String,
    name: String,
    distanceKm: Number,
    extraAmount: Number,
  },
  { _id: false }
);

const includedPlaceSchema = new mongoose.Schema(
  {
    placeId: String,
    name: String,
    description: String,
    distanceKm: Number,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageSnapshot: { type: packageSnapshotSchema, required: true },
    travellerName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: true, trim: true },
    travelDate: { type: Date, required: true },
    travellersCount: { type: Number, required: true, min: 1, default: 1 },
    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled"],
      default: "pending_payment",
    },
    totalAmount: { type: Number, required: true, min: 0 },
    ticketPdfUrl: { type: String, default: null },
    includedPlaces: { type: [includedPlaceSchema], default: [] },
    addOns: { type: [addOnSchema], default: [] },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    paymentMethod: { type: String, default: null },
    upiTxnId: { type: String, default: null },
    /** Merchant / receiving UPI (internal — not shown to guests) */
    payeeUpiId: { type: String, default: null },
    /** Payer's UPI ID entered by the customer at payment */
    payerUpiId: { type: String, default: null },
    paidAt: { type: Date, default: null },
    cartGroupId: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

bookingSchema.index({ orderId: 1, email: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
