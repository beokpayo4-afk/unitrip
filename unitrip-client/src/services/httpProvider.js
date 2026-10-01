import { api } from "@/api/client";

const ACTIONS = {
  search: "search",
  getDetails: "details",
  createBooking: "bookings",
  getBooking: "booking",
  cancelBooking: "cancel",
};

/** Calls the server adapter. The browser never sends provider credentials. */
export function httpProvider(serviceName) {
  async function call(action, body) {
    return api(`/api/integrations/${serviceName}/${ACTIONS[action]}`, {
      method: "POST",
      body: JSON.stringify(body || {}),
    });
  }

  return {
    name: "http",
    search: (criteria) => call("search", { criteria }),
    getDetails: (id) => call("getDetails", { id }),
    createBooking: (booking) => call("createBooking", { booking }),
    getBooking: (reference) => call("getBooking", { reference }),
    cancelBooking: (reference) => call("cancelBooking", { reference }),
  };
}
