import { api } from "@/api/client";

/**
 * Custom trip requests.
 * `apiTripEnquiry` stores them in the UnitTrip database.
 * Admin reads the same records from /api/trip-enquiries/admin/all.
 */
export const apiTripEnquiry = {
  name: "api",
  async submit(payload) {
    return api("/api/trip-enquiries", { method: "POST", body: JSON.stringify(payload) });
  },
};

export const tripEnquiryService = {
  provider: apiTripEnquiry,

  async submit(payload) {
    return this.provider.submit(payload);
  },
};

const SAVED_PREFIX = "unitrip_trip_saved_";

export function rememberTripEnquiry(reference, record) {
  sessionStorage.setItem(`${SAVED_PREFIX}${reference}`, JSON.stringify(record));
}

export function readTripEnquiry(reference) {
  try {
    return JSON.parse(sessionStorage.getItem(`${SAVED_PREFIX}${reference}`) || "null");
  } catch {
    return null;
  }
}
