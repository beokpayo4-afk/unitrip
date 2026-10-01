import { paymentService } from "@/services/paymentService";

export const flightPayment = {
  async startCheckout(request) {
    return paymentService.createBooking({ ...request, product: "flight" });
  },
};
