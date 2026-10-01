import { Outlet } from "react-router-dom";
import { TripPlannerProvider } from "@/travel/context/TripPlannerProvider";

export default function TravelLayout() {
  return (
    <TripPlannerProvider>
      <Outlet />
    </TripPlannerProvider>
  );
}
