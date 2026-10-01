import { Navigate, useNavigate } from "react-router-dom";
import { useFlightBooking } from "@/flights/context/bookingContext";
import { FlightDetails } from "@/flights/components/FlightDetails";
import { FlightStepper } from "@/flights/components/FlightStepper";
import { SampleDataNotice } from "@/flights/components/SampleDataNotice";

export default function FlightDetailsPage() {
  const { draft } = useFlightBooking();
  const navigate = useNavigate();
  if (!draft.selectedOffer) return <Navigate to="/flights/results" replace />;

  return (
    <div className="container-page py-10">
      <FlightStepper current="Details" />
      <div className="mb-6 space-y-3">
        <h1 className="font-display text-4xl font-bold">Flight details</h1>
        <SampleDataNotice />
      </div>
      <FlightDetails
        offer={draft.selectedOffer}
        search={draft.search}
        onContinue={() => navigate("/flights/passengers")}
      />
    </div>
  );
}
