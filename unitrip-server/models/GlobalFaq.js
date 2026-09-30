import mongoose from "mongoose";

const globalFaqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GlobalFaq = mongoose.model("GlobalFaq", globalFaqSchema);
export default GlobalFaq;
