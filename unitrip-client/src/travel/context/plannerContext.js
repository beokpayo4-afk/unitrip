import { createContext, useContext } from "react";

export const TripPlannerContext = createContext(null);

export function useTripPlanner() {
  const value = useContext(TripPlannerContext);
  if (!value) throw new Error("useTripPlanner must be used within TripPlannerProvider");
  return value;
}
