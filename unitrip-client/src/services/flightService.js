import { mockFlightProvider } from "./providers/mockFlightProvider";
import { selectProvider } from "./selectProvider";

const provider = selectProvider("flight", mockFlightProvider);

export const flightService = {
  search: (criteria) => provider.search(criteria),
  getDetails: (id) => provider.getDetails(id),
  createBooking: (booking) => provider.createBooking(booking),
  getBooking: (reference) => provider.getBooking(reference),
  cancelBooking: (reference) => provider.cancelBooking(reference),
};
