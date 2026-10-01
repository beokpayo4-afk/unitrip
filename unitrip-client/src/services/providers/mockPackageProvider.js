import { fetchHolidayPackage, fetchPublishedHolidayPackages } from "@/holidays/services/holidayCatalog";
import { filterHolidayPackages } from "@/holidays/services/filterPackages";
import { getHolidayBooking, replaceHolidayBooking, saveHolidayBooking } from "@/holidays/services/holidayBookings";
import { api } from "@/api/client";

const details = new Map();

export const mockPackageProvider = {
  name: "mock",

  async search(criteria = {}) {
    const packages = await fetchPublishedHolidayPackages();
    packages.forEach((item) => details.set(item.slug, item));
    const items = criteria.filters ? filterHolidayPackages(packages, criteria.filters) : packages;
    return { provider: "mock", packages: items };
  },

  async getDetails(slug) {
    if (details.has(slug)) return details.get(slug);
    const item = await fetchHolidayPackage(slug);
    if (item) details.set(slug, item);
    return item;
  },

  async createBooking(booking) {
    return saveHolidayBooking(booking);
  },

  async getBooking(reference) {
    return getHolidayBooking(reference);
  },

  async cancelBooking(reference) {
    const current = getHolidayBooking(reference);
    if (!current) return null;
    const cancelled = {
      ...current,
      status: "cancelled",
      statusLabel: "Cancelled — departure was not confirmed",
      departureConfirmed: false,
    };
    replaceHolidayBooking(cancelled);
    try {
      await api(`/api/module-bookings/${encodeURIComponent(reference)}/cancel`, { method: "POST" });
    } catch {
      /* Local cancellation still stands. */
    }
    return cancelled;
  },
};
