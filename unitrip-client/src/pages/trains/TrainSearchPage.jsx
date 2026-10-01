import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrainBooking } from "@/trains/context/bookingContext";
import { SampleTrainNotice } from "@/trains/components/SampleTrainNotice";
import { TrainSearchForm } from "@/trains/components/TrainSearchForm";
import { TrainStepper } from "@/trains/components/TrainStepper";

export default function TrainSearchPage() {
  const { draft, setSearch, submitSearch } = useTrainBooking();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  async function onSubmit() {
    const nextErrors = await submitSearch();
    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }
    navigate("/trains/results");
  }

  return (
    <div className="container-page py-10">
      <TrainStepper current="Search" />
      <div className="mb-6 space-y-3">
        <h1 className="font-display text-4xl font-bold">Trains</h1>
        <p className="text-muted-foreground">Search the sample timetable by station, date, class, and quota.</p>
        <SampleTrainNotice />
      </div>
      <TrainSearchForm search={draft.search} errors={errors} onChange={setSearch} onSubmit={onSubmit} />
    </div>
  );
}
