import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useHotelBooking } from "@/hotels/context/bookingContext";
import { HotelPaymentPanel } from "@/hotels/components/HotelPaymentPanel";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { createHotelReference, saveHotelBooking } from "@/hotels/services/hotelBookings";
import { hotelPayment } from "@/hotels/services/hotelPayment";
import { selectedStay } from "@/hotels/services/hotelSearch";

export default function HotelPaymentPage() {
  const { draft } = useHotelBooking();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { hotel, room } = selectedStay(draft);
  if (!hotel || !room) return <Navigate to="/hotels" replace />;

  async function onContinue() {
    setBusy(true);
    setError("");
    const payment = await hotelPayment.startCheckout({
      amount: room.price.total,
      currency: room.price.currency,
    });
    const booking = {
      reference: createHotelReference(),
      status: "payment_pending",
      statusLabel: "Payment pending — no charge made",
      payment,
      createdAt: new Date().toISOString(),
      search: draft.search,
      hotel: {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        area: hotel.area,
        stars: hotel.stars,
      },
      room: {
        id: room.id,
        name: room.name,
        bedType: room.bedType,
        meals: room.meals,
        cancellation: room.cancellation,
      },
      guest: draft.guest,
      fare: room.price,
    };
    try {
      const saved = await saveHotelBooking(booking);
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
