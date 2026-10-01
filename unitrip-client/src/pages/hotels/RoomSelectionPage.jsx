import { Navigate, useNavigate } from "react-router-dom";
import { useHotelBooking } from "@/hotels/context/bookingContext";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { RoomList } from "@/hotels/components/RoomList";
import { SampleStayNotice } from "@/hotels/components/SampleStayNotice";

export default function RoomSelectionPage() {
  const { draft, selectRoom } = useHotelBooking();
  const navigate = useNavigate();
  const hotel = draft.result?.hotels?.find((item) => item.id === draft.selectedHotelId) || null;
  if (!hotel) return <Navigate to="/hotels/results" replace />;

  return (
    <div className="container-page py-10">
      <HotelStepper current="Room" />
      <div className="mb-6 space-y-2">
        <h1 className="font-display text-4xl font-bold">Select a room</h1>
        <p className="text-muted-foreground">
          {hotel.name} · {hotel.area}, {hotel.city}
        </p>
        <SampleStayNotice />
      </div>
      <RoomList
        rooms={hotel.rooms}
        selectedId={draft.selectedRoomId}
        onSelect={(room) => {
          selectRoom(hotel.id, room.id);
          navigate("/hotels/guests");
        }}
      />
    </div>
  );
}
