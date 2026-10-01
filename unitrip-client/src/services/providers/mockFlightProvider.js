import { searchFlights } from "@/flights/services/flightSearch";
import { getFlightBooking, saveFlightBooking } from "@/flights/services/flightBookings";
import { api } from "@/api/client";

const details = new Map();

function remember(offers = []) {
  offers.forEach((offer) => details.set(offer.id, offer));
}

export const mockFlightProvider = {
  name: "mock",

  async search(criteria) {
    const result = searchFlights(criteria);
    remember(result.offers);
    return { ...result, provider: "mock" };
  },

  async getDetails(id) {
    return details.get(id) || null;
  },

  async createBooking(booking) {
    return saveFlightBooking(booking);
  },

  async getBooking(reference) {
    return getFlightBooking(reference);
  },

  async cancelBooking(reference) {
    const current = getFlightBooking(reference);
    if (!current) return null;
    const cancelled = {
      ...current,
      status: "cancelled",
      statusLabel: "Cancelled — no charge was made",
    };
    await saveFlightBooking(cancelled);
    try {
      await api(`/api/module-bookings/${encodeURIComponent(reference)}/cancel`, { method: "POST" });
    } catch {
      /* The local copy is already cancelled. The server copy may not exist yet. */
    }
    return cancelled;
  },
};
