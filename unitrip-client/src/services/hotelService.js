import { mockHotelProvider } from "./providers/mockHotelProvider";
import { selectProvider } from "./selectProvider";

const provider = selectProvider("hotel", mockHotelProvider);

export const hotelService = {
  search: (criteria) => provider.search(criteria),
  getDetails: (id) => provider.getDetails(id),
  createBooking: (booking) => provider.createBooking(booking),
  getBooking: (reference) => provider.getBooking(reference),
  cancelBooking: (reference) => provider.cancelBooking(reference),
};
