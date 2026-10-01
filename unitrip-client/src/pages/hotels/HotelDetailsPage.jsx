import { Navigate, useNavigate } from "react-router-dom";
import { useHotelBooking } from "@/hotels/context/bookingContext";
import { HotelDetails } from "@/hotels/components/HotelDetails";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { SampleStayNotice } from "@/hotels/components/SampleStayNotice";

export default function HotelDetailsPage() {
  const { draft, selectRoom } = useHotelBooking();
  const navigate = useNavigate();
  const hotel = draft.result?.hotels?.find((item) => item.id === draft.selectedHotelId) || null;
  if (!hotel) return <Navigate to="/hotels/results" replace />;

  return (
    <div className="container-page py-10">
      <HotelStepper current="Details" />
      <div className="mb-6 space-y-3">
        <h1 className="font-display text-4xl font-bold">Hotel details</h1>
        <SampleStayNotice />
      </div>
      <HotelDetails
        hotel={hotel}
        onBrowseRooms={() => navigate("/hotels/rooms")}
        onSelectRoom={(room) => {
          selectRoom(hotel.id, room.id);
          navigate("/hotels/guests");
        }}
      />
    </div>
  );
}
