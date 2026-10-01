import { Navigate, useNavigate } from "react-router-dom";
import { useHotelBooking } from "@/hotels/context/bookingContext";
import { HotelBookingSummary } from "@/hotels/components/HotelBookingSummary";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { selectedStay } from "@/hotels/services/hotelSearch";

export default function HotelSummaryPage() {
  const { draft } = useHotelBooking();
  const navigate = useNavigate();
  const { hotel, room } = selectedStay(draft);
  if (!hotel || !room || !draft.guest.name) return <Navigate to="/hotels/guests" replace />;

  return (
    <div className="container-page py-10">
      <HotelStepper current="Summary" />
      <h1 className="mb-6 font-display text-4xl font-bold">Booking summary</h1>
      <HotelBookingSummary
        hotel={hotel}
        room={room}
        search={draft.search}
        guest={draft.guest}
        onContinue={() => navigate("/hotels/payment")}
      />
    </div>
  );
}
