import { createContext, useContext } from "react";

export const TrainBookingContext = createContext(null);

export function useTrainBooking() {
  const value = useContext(TrainBookingContext);
  if (!value) throw new Error("useTrainBooking must be used within TrainBookingProvider");
  return value;
}
