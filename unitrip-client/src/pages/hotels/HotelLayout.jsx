import { Outlet } from "react-router-dom";
import { HotelBookingProvider } from "@/hotels/context/HotelBookingProvider";

export default function HotelLayout() {
  return (
    <HotelBookingProvider>
      <Outlet />
    </HotelBookingProvider>
  );
}
