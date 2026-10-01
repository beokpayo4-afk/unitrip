import { mockNotificationProvider } from "./providers/mockNotificationProvider";
import { selectProvider } from "./selectProvider";

const provider = selectProvider("notification", mockNotificationProvider);

export const notificationService = {
  search: () => provider.search(),
  getDetails: (id) => provider.getDetails(id),
  createBooking: (notice) => provider.createBooking(notice),
  getBooking: (reference) => provider.getBooking(reference),
  cancelBooking: (reference) => provider.cancelBooking(reference),
};
