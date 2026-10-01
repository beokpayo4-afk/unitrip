import { mockPackageProvider } from "./providers/mockPackageProvider";
import { selectProvider } from "./selectProvider";

const provider = selectProvider("package", mockPackageProvider);
const requests = new Map();

function catalogVersion() {
  return sessionStorage.getItem("unitrip_holiday_catalog_version") || "0";
}

export const packageService = {
  search: (criteria) => provider.search(criteria),
  getDetails: (slug) => provider.getDetails(slug),
  createBooking: (booking) => provider.createBooking(booking),
  getBooking: (reference) => provider.getBooking(reference),
  cancelBooking: (reference) => provider.cancelBooking(reference),
};

export function publishedPackagesPromise() {
  const key = `list:${catalogVersion()}`;
  if (!requests.has(key)) requests.set(key, packageService.search());
  return requests.get(key);
}

export function packageDetailsPromise(slug) {
  const key = `slug:${catalogVersion()}:${slug}`;
  if (!requests.has(key)) requests.set(key, packageService.getDetails(slug));
  return requests.get(key);
}
