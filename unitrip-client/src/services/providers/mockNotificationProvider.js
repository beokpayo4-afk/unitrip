const STORAGE_KEY = "unitrip_notifications";

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

export const mockNotificationProvider = {
  name: "mock",

  async search() {
    return { provider: "mock", notifications: readAll() };
  },

  async getDetails(id) {
    return readAll().find((item) => item.id === id) || null;
  },

  /**
   * Records a notice for a booking. Nothing is emailed or sent to WhatsApp.
   */
  async createBooking({ product, reference, email, title }) {
    const notice = {
      id: `ntf_${crypto.randomUUID()}`,
      product: product || "booking",
      reference: reference || null,
      email: email || "",
      title: title || "Booking notice",
      delivered: false,
      channel: "mock",
      createdAt: new Date().toISOString(),
      message: "Saved in this browser only. No email or SMS was sent.",
    };
    writeAll([notice, ...readAll()]);
    return notice;
  },

  async getBooking(reference) {
    return readAll().find((item) => item.reference === reference) || null;
  },

  async cancelBooking(reference) {
    const items = readAll();
    const current = items.find((item) => item.reference === reference);
    if (!current) return null;
    const cancelled = { ...current, delivered: false, message: "Notice cancelled. Nothing was sent." };
    writeAll(items.map((item) => (item.id === current.id ? cancelled : item)));
    return cancelled;
  },
};
