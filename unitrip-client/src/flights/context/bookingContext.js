import { createContext, useContext } from "react";

export const FlightBookingContext = createContext(null);

export function useFlightBooking() {
  const value = useContext(FlightBookingContext);
  if (!value) throw new Error("useFlightBooking must be used within FlightBookingProvider");
  return value;
}
