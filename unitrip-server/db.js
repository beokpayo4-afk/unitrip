import mongoose from "mongoose";
import logger from "./utils/logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection failed", { err: error.message, stack: error.stack });
    process.exit(1);
  }
};

export default connectDB;
