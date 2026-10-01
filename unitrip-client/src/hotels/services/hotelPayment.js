import { paymentService } from "@/services/paymentService";

export const hotelPayment = {
  async startCheckout(request) {
    return paymentService.createBooking({ ...request, product: "hotel" });
  },
};
