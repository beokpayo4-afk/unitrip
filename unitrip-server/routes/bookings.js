import { Router } from "express";
import {
  createBooking,
  checkoutCart,
  createCartPaymentOrder,
  verifyCartPayment,
  trackBooking,
  getTicket,
  myBookings,
  addBookingAddOns,
  createPaymentOrder,
  verifyPayment,
  confirmUpiPayment,
  confirmCartUpiPayment,
  downloadTicketPdf,
  regenerateTicketPdf,
  adminListBookings,
  adminUpdateBooking,
} from "../controllers/bookingController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/track", trackBooking);
router.get("/ticket", getTicket);
router.get("/ticket.pdf", downloadTicketPdf);
router.post("/addons", addBookingAddOns);
router.post("/payment/verify", protect, verifyPayment);
router.post("/cart/payment/verify", protect, verifyCartPayment);
router.post("/cart/:cartGroupId/confirm-upi", protect, confirmCartUpiPayment);

router.post("/", protect, createBooking);
router.post("/checkout", protect, checkoutCart);
router.get("/mine", protect, myBookings);
router.post("/addons/auth", protect, addBookingAddOns);
router.post("/cart/:cartGroupId/pay", protect, createCartPaymentOrder);
router.post("/:id/pay", protect, createPaymentOrder);
router.post("/:id/confirm-upi", protect, confirmUpiPayment);
router.post("/:id/ticket-pdf", protect, regenerateTicketPdf);

router.get("/admin/all", protect, requireAdmin, adminListBookings);
router.patch("/admin/:id", protect, requireAdmin, adminUpdateBooking);

export default router;
