import { paymentService } from "@/services/paymentService";

export const trainPayment = {
  async startCheckout(request) {
    return paymentService.createBooking({ ...request, product: "train" });
  },
};
