import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useFlightBooking } from "@/flights/context/bookingContext";
import { PassengerDetailsForm } from "@/flights/components/PassengerDetailsForm";
import { FlightStepper } from "@/flights/components/FlightStepper";
import { validatePassengers } from "@/flights/validation/passengers";

export default function PassengerDetailsPage() {
  const { draft, setPassengers } = useFlightBooking();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  if (!draft.selectedOffer) return <Navigate to="/flights" replace />;

  function onSubmit() {
    const nextErrors = validatePassengers(draft.passengers, {
      international: draft.selectedOffer.international,
      travelDate: draft.selectedOffer.legs[0].date,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) navigate("/flights/summary");
  }

  return (
    <div className="container-page py-10">
      <FlightStepper current="Passengers" />
      <div className="mb-6">
        <h1 className="font-display text-4xl font-bold">Passenger details</h1>
        <p className="mt-2 text-muted-foreground">
          Enter each traveller exactly as it should appear on the reservation.
        </p>
      </div>
      <PassengerDetailsForm
        passengers={draft.passengers}
        errors={errors}
        international={draft.selectedOffer.international}
        onChange={setPassengers}
        onSubmit={onSubmit}
      />
    </div>
  );
}
