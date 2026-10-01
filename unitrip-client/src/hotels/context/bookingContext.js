import { createContext, useContext } from "react";

export const HotelBookingContext = createContext(null);

export function useHotelBooking() {
  const value = useContext(HotelBookingContext);
  if (!value) throw new Error("useHotelBooking must be used within HotelBookingProvider");
  return value;
}
