import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlightBooking } from "@/flights/context/bookingContext";
import { FlightSearchForm } from "@/flights/components/FlightSearchForm";
import { FlightStepper } from "@/flights/components/FlightStepper";
import { SampleDataNotice } from "@/flights/components/SampleDataNotice";

export default function FlightSearchPage() {
  const { draft, setSearch, submitSearch } = useFlightBooking();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function onSubmit() {
    const nextErrors = submitSearch();
    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }
    navigate("/flights/results");
  }

  return (
    <div className="container-page py-10">
      <FlightStepper current="Search" />
      <div className="mb-6 space-y-3">
        <h1 className="font-display text-4xl font-bold">Flights</h1>
        <p className="text-muted-foreground">
          Search one way, round trip, or multi city sample itineraries.
        </p>
        <SampleDataNotice />
      </div>
      <FlightSearchForm
        search={draft.search}
        errors={errors}
        onChange={setSearch}
        onSubmit={onSubmit}
      />
    </div>
  );
}
