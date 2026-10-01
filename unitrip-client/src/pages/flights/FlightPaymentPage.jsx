import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useFlightBooking } from "@/flights/context/bookingContext";
import { FlightPaymentPanel } from "@/flights/components/FlightPaymentPanel";
import { FlightStepper } from "@/flights/components/FlightStepper";
import { flightPayment } from "@/flights/services/flightPayment";
import { createReference, saveFlightBooking } from "@/flights/services/flightBookings";

export default function FlightPaymentPage() {
  const { draft } = useFlightBooking();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  if (!draft.selectedOffer) return <Navigate to="/flights" replace />;

  async function onContinue() {
    setBusy(true);
    setError("");
    const offer = draft.selectedOffer;
    const payment = await flightPayment.startCheckout({
      amount: offer.price.total,
      currency: offer.price.currency,
    });
    const booking = {
      reference: createReference(),
      status: "payment_pending",
      statusLabel: "Payment pending — no charge made",
      payment,
      createdAt: new Date().toISOString(),
      search: draft.search,
      offer,
      passengers: draft.passengers,
      fare: offer.price,
    };
    try {
      const saved = await saveFlightBooking(booking);
      navigate(`/flights/confirmation/${saved.reference}`);
    } catch (err) {
      setError(err.message || "The booking was not saved.");
      setBusy(false);
    }
  }

  return (
    <div className="container-page py-10">
      <FlightStepper current="Payment" />
      <h1 className="mb-6 font-display text-4xl font-bold">Payment</h1>
      <FlightPaymentPanel
        amount={draft.selectedOffer.price.total}
        busy={busy}
        onContinue={onContinue}
      />
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
