import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTrainBooking } from "@/trains/context/bookingContext";
import { TrainPaymentPanel } from "@/trains/components/TrainPaymentPanel";
import { TrainStepper } from "@/trains/components/TrainStepper";
import { quoteTrain } from "@/trains/services/pricing";
import { selectedJourney } from "@/trains/services/trainSearch";

export default function TrainPaymentPage() {
  const { draft, completeBooking } = useTrainBooking();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { train, travelClass } = selectedJourney(draft);
  if (!train || !travelClass) return <Navigate to="/trains" replace />;

  const fare = quoteTrain({
    fare: travelClass.fare,
    passengers: draft.passengers.length,
    quota: draft.search.quota,
  });

  async function onContinue() {
    setBusy(true);
    setError("");
    try {
      const saved = await completeBooking();
      if (!saved) {
        setBusy(false);
        return;
      }
      navigate(`/trains/confirmation/${saved.reference}`);
    } catch (err) {
      setError(err.message || "The booking was not saved.");
      setBusy(false);
    }
  }

  return (
    <div className="container-page py-10">
      <TrainStepper current="Payment" />
      <h1 className="mb-6 font-display text-4xl font-bold">Payment</h1>
      <TrainPaymentPanel amount={fare.total} busy={busy} onContinue={onContinue} />
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
