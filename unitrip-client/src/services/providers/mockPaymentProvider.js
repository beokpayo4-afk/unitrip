const STORAGE_KEY = "unitrip_payment_records";

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 40)));
}

export const mockPaymentProvider = {
  name: "mock",

  async search() {
    return { provider: "mock", payments: readAll() };
  },

  async getDetails(id) {
    return readAll().find((item) => item.id === id) || null;
  },

  /**
   * Starts a checkout record. The mock provider does not capture money.
   */
  async createBooking({ amount, currency, product, reference }) {
    const record = {
      id: `pay_${crypto.randomUUID()}`,
      reference: reference || null,
      product: product || "booking",
      provider: "mock",
      status: "not_charged",
      captured: false,
      amount,
      currency: currency || "INR",
      createdAt: new Date().toISOString(),
      message: "No payment was captured. Connect a payment gateway on the server when you are ready to take real payments.",
    };
    writeAll([record, ...readAll()]);
    return record;
  },

  async getBooking(reference) {
    return readAll().find((item) => item.reference === reference) || null;
  },

  async cancelBooking(reference) {
    const items = readAll();
    const current = items.find((item) => item.reference === reference || item.id === reference);
    if (!current) return null;
    const cancelled = { ...current, status: "cancelled", captured: false };
    writeAll(items.map((item) => (item.id === current.id ? cancelled : item)));
    return cancelled;
  },
};
