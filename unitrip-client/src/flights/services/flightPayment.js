/**
 * Payment boundary for flight reservations.
 * `placeholderPaymentProvider` never captures money.
 * Replace `flightPayment.provider` with a gateway adapter that returns the same shape.
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

export const flightPayment = {
  provider: placeholderPaymentProvider,

  async startCheckout(request) {
    return this.provider.startCheckout(request);
  },
};
