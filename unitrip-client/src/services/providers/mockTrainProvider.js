import { trainInventory } from "@/trains/services/trainInventory";
import { getTrainBooking, saveTrainBooking } from "@/trains/services/trainBookings";
import { api } from "@/api/client";

const details = new Map();

export const mockTrainProvider = {
  name: "mock",

  async search(criteria) {
    const result = await trainInventory.search(criteria);
    (result.trains || []).forEach((train) => details.set(train.id, train));
    return { ...result, provider: "mock" };
  },

  async getDetails(id) {
    return details.get(id) || null;
  },

  async createBooking(booking) {
    return saveTrainBooking(booking);
  },

  async getBooking(reference) {
    return getTrainBooking(reference);
  },

  async cancelBooking(reference) {
    const current = getTrainBooking(reference);
    if (!current) return null;
    const cancelled = {
      ...current,
      status: "cancelled",
      statusLabel: "Cancelled — no seat was reserved",
      seatConfirmed: false,
      pnr: null,
    };
    await saveTrainBooking(cancelled);
    try {
      await api(`/api/module-bookings/${encodeURIComponent(reference)}/cancel`, { method: "POST" });
    } catch {
      /* Local cancellation still stands. */
    }
    return cancelled;
  },
};
