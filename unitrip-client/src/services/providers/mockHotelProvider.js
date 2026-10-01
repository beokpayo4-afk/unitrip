import { searchHotels } from "@/hotels/services/hotelSearch";
import { getHotelBooking, saveHotelBooking } from "@/hotels/services/hotelBookings";
import { api } from "@/api/client";

const details = new Map();

export const mockHotelProvider = {
  name: "mock",

  async search(criteria) {
    const result = searchHotels(criteria);
    result.hotels.forEach((hotel) => details.set(hotel.id, hotel));
    return { ...result, provider: "mock" };
  },

  async getDetails(id) {
    return details.get(id) || null;
  },

  async createBooking(booking) {
    return saveHotelBooking(booking);
  },

  async getBooking(reference) {
    return getHotelBooking(reference);
  },

  async cancelBooking(reference) {
    const current = getHotelBooking(reference);
    if (!current) return null;
    const cancelled = {
      ...current,
      status: "cancelled",
      statusLabel: "Cancelled — no charge was made",
    };
    await saveHotelBooking(cancelled);
    try {
      await api(`/api/module-bookings/${encodeURIComponent(reference)}/cancel`, { method: "POST" });
    } catch {
      /* Local cancellation still stands. */
    }
    return cancelled;
  },
};
