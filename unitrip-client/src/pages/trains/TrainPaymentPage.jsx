import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTrainBooking } from "@/trains/context/bookingContext";
import { TrainPaymentPanel } from "@/trains/components/TrainPaymentPanel";
import { TrainStepper } from "@/trains/components/TrainStepper";
import { quoteTrain } from "@/trains/services/pricing";
import { buildSampleBooking, saveTrainBooking } from "@/trains/services/trainBookings";
import { trainPayment } from "@/trains/services/trainPayment";
import { selectedJourney } from "@/trains/services/trainSearch";

export default function TrainPaymentPage() {
  const { draft } = useTrainBooking();
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
    const payment = await trainPayment.startCheckout({
      amount: fare.total,
      currency: fare.currency,
    });
    const booking = buildSampleBooking({
      payment,
      search: draft.search,
      train: { name: train.name, number: train.number, type: train.type },
      journey: {
        from: train.from.name,
        to: train.to.name,
        departure: train.from.departure,
        arrival: train.to.arrival,
        date: draft.search.journeyDate,
        classCode: travelClass.code,
        quota: draft.search.quota,
      },
      passengers: draft.passengers,
      fare,
    });
    try {
      const saved = await saveTrainBooking(booking);
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
