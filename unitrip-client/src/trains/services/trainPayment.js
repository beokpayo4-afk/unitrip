/**
 * Payment boundary for train reservations.
 * The placeholder provider never captures money and never issues a PNR.
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
        "No payment was captured. Connect an authorised payment provider here later. This does not book a railway seat.",
    };
  },
};

export const trainPayment = {
  provider: placeholderPaymentProvider,

  async startCheckout(request) {
    return this.provider.startCheckout(request);
  },
};
