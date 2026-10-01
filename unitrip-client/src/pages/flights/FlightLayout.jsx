import { Outlet } from "react-router-dom";
import { FlightBookingProvider } from "@/flights/context/FlightBookingProvider";

export default function FlightLayout() {
  return (
    <FlightBookingProvider>
      <Outlet />
    </FlightBookingProvider>
  );
}
