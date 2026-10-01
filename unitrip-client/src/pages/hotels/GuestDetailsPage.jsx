import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useHotelBooking } from "@/hotels/context/bookingContext";
import { GuestDetailsForm } from "@/hotels/components/GuestDetailsForm";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { selectedStay } from "@/hotels/services/hotelSearch";
import { validateGuest } from "@/hotels/validation/guest";

export default function GuestDetailsPage() {
  const { draft, setGuest } = useHotelBooking();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { room } = selectedStay(draft);
  if (!room) return <Navigate to="/hotels/rooms" replace />;

  function onSubmit() {
    const nextErrors = validateGuest(draft.guest);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) navigate("/hotels/summary");
  }

  return (
    <div className="container-page py-10">
      <HotelStepper current="Guests" />
      <div className="mb-6">
        <h1 className="font-display text-4xl font-bold">Guest details</h1>
        <p className="mt-2 text-muted-foreground">
          {room.name} at {selectedStay(draft).hotel.name}
        </p>
      </div>
      <GuestDetailsForm guest={draft.guest} errors={errors} onChange={setGuest} onSubmit={onSubmit} />
    </div>
  );
}
