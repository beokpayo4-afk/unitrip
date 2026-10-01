import { mockPaymentProvider } from "./providers/mockPaymentProvider";
import { selectProvider } from "./selectProvider";

const provider = selectProvider("payment", mockPaymentProvider);

export const paymentService = {
  search: () => provider.search(),
  getDetails: (id) => provider.getDetails(id),
  createBooking: (checkout) => provider.createBooking(checkout),
  getBooking: (reference) => provider.getBooking(reference),
  cancelBooking: (reference) => provider.cancelBooking(reference),
};
