/**
 * Provider names only. API keys and secrets stay in server environment variables.
 * Allowed values: "mock" (default) or "http" (calls the UnitTrip server adapter).
 */
function readProvider(name) {
  const value = String(import.meta.env[name] || "mock").trim().toLowerCase();
  return value === "http" ? "http" : "mock";
}

export const providerConfig = {
  flight: readProvider("VITE_FLIGHT_PROVIDER"),
  hotel: readProvider("VITE_HOTEL_PROVIDER"),
  train: readProvider("VITE_TRAIN_PROVIDER"),
  package: readProvider("VITE_PACKAGE_PROVIDER"),
  payment: readProvider("VITE_PAYMENT_PROVIDER"),
  notification: readProvider("VITE_NOTIFICATION_PROVIDER"),
};
