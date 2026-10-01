import { Outlet } from "react-router-dom";
import { TrainBookingProvider } from "@/trains/context/TrainBookingProvider";

export default function TrainLayout() {
  return (
    <TrainBookingProvider>
      <Outlet />
    </TrainBookingProvider>
  );
}
