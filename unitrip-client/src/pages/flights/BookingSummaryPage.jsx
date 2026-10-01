import { Navigate, useNavigate } from "react-router-dom";
import { useFlightBooking } from "@/flights/context/bookingContext";
import { BookingSummary } from "@/flights/components/BookingSummary";
import { FlightStepper } from "@/flights/components/FlightStepper";

export default function BookingSummaryPage() {
  const { draft } = useFlightBooking();
  const navigate = useNavigate();
  if (!draft.selectedOffer || draft.passengers.some((passenger) => !passenger.firstName)) {
    return <Navigate to="/flights/passengers" replace />;
  }

  return (
    <div className="container-page py-10">
      <FlightStepper current="Summary" />
      <h1 className="mb-6 font-display text-4xl font-bold">Booking summary</h1>
      <BookingSummary
        offer={draft.selectedOffer}
        search={draft.search}
        passengers={draft.passengers}
        onContinue={() => navigate("/flights/payment")}
      />
    </div>
  );
}
