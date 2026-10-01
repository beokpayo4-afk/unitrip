import { mockTrainProvider } from "./providers/mockTrainProvider";
import { selectProvider } from "./selectProvider";

const provider = selectProvider("train", mockTrainProvider);

export const trainService = {
  search: (criteria) => provider.search(criteria),
  getDetails: (id) => provider.getDetails(id),
  createBooking: (booking) => provider.createBooking(booking),
  getBooking: (reference) => provider.getBooking(reference),
  cancelBooking: (reference) => provider.cancelBooking(reference),
};
