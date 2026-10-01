import { createContext, useContext } from "react";

export const HolidayBookingContext = createContext(null);

export function useHolidayBooking() {
  const value = useContext(HolidayBookingContext);
  if (!value) throw new Error("useHolidayBooking must be used within HolidayBookingProvider");
  return value;
}
