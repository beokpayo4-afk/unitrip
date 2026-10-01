import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTrainBooking } from "@/trains/context/bookingContext";
import { PassengerDetailsForm } from "@/trains/components/PassengerDetailsForm";
import { TrainStepper } from "@/trains/components/TrainStepper";
import { selectedJourney } from "@/trains/services/trainSearch";
import { validatePassengers } from "@/trains/validation/passengers";

export default function TrainPassengersPage() {
  const { draft, setPassengers } = useTrainBooking();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { train, travelClass } = selectedJourney(draft);
  if (!train || !travelClass) return <Navigate to="/trains/details" replace />;

  function onSubmit() {
    const nextErrors = validatePassengers(draft.passengers, {
      classCode: travelClass.code,
      quota: draft.search.quota,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) navigate("/trains/summary");
  }

  return (
    <div className="container-page py-10">
      <TrainStepper current="Passengers" />
      <div className="mb-6">
        <h1 className="font-display text-4xl font-bold">Passenger details</h1>
        <p className="mt-2 text-muted-foreground">
          {train.name} · {travelClass.code} · {train.from.name} to {train.to.name}
        </p>
      </div>
      <PassengerDetailsForm
        passengers={draft.passengers}
        errors={errors}
        classCode={travelClass.code}
        onChange={setPassengers}
        onSubmit={onSubmit}
      />
    </div>
  );
}
