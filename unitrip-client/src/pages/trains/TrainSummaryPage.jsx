import { Navigate, useNavigate } from "react-router-dom";
import { useTrainBooking } from "@/trains/context/bookingContext";
import { TrainBookingSummary } from "@/trains/components/TrainBookingSummary";
import { TrainStepper } from "@/trains/components/TrainStepper";
import { quoteTrain } from "@/trains/services/pricing";
import { selectedJourney } from "@/trains/services/trainSearch";

export default function TrainSummaryPage() {
  const { draft } = useTrainBooking();
  const navigate = useNavigate();
  const { train, travelClass } = selectedJourney(draft);
  if (!train || !travelClass || !draft.passengers[0]?.name) {
    return <Navigate to="/trains/passengers" replace />;
  }
  const fare = quoteTrain({
    fare: travelClass.fare,
    passengers: draft.passengers.length,
    quota: draft.search.quota,
  });

  return (
    <div className="container-page py-10">
      <TrainStepper current="Summary" />
      <h1 className="mb-6 font-display text-4xl font-bold">Booking summary</h1>
      <TrainBookingSummary
        train={train}
        travelClass={travelClass}
        search={draft.search}
        passengers={draft.passengers}
        fare={fare}
        onContinue={() => navigate("/trains/payment")}
      />
    </div>
  );
}
