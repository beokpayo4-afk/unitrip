import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useHotelBooking } from "@/hotels/context/bookingContext";
import { HotelPaymentPanel } from "@/hotels/components/HotelPaymentPanel";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { selectedStay } from "@/hotels/services/hotelSearch";

export default function HotelPaymentPage() {
  const { draft, completeBooking } = useHotelBooking();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { hotel, room } = selectedStay(draft);
  if (!hotel || !room) return <Navigate to="/hotels" replace />;

  async function onContinue() {
    setBusy(true);
    setError("");
    try {
      const saved = await completeBooking();
      if (!saved) {
        setBusy(false);
        return;
      }
      navigate(`/hotels/confirmation/${saved.reference}`);
    } catch (err) {
      setError(err.message || "The booking was not saved.");
      setBusy(false);
    }
  }

  return (
    <div className="container-page py-10">
      <HotelStepper current="Payment" />
      <h1 className="mb-6 font-display text-4xl font-bold">Payment</h1>
      <HotelPaymentPanel amount={room.price.total} busy={busy} onContinue={onContinue} />
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
