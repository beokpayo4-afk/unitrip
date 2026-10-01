/**
 * Payment boundary for hotel reservations.
 * `placeholderPaymentProvider` never captures money.
 * Replace `hotelPayment.provider` with a gateway adapter that returns the same shape.
 */
export const placeholderPaymentProvider = {
  name: "placeholder",
  async startCheckout({ amount, currency }) {
    return {
      provider: "placeholder",
      status: "not_charged",
      captured: false,
      amount,
      currency,
      message:
        "No payment was captured. Connect a payment gateway here when you are ready to take real payments.",
    };
  },
};

export const hotelPayment = {
  provider: placeholderPaymentProvider,

  async startCheckout(request) {
    return this.provider.startCheckout(request);
  },
};
