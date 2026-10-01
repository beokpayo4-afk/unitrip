import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotelBooking } from "@/hotels/context/bookingContext";
import { HotelSearchForm } from "@/hotels/components/HotelSearchForm";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { SampleStayNotice } from "@/hotels/components/SampleStayNotice";

export default function HotelSearchPage() {
  const { draft, setSearch, submitSearch } = useHotelBooking();
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  function onSubmit() {
    const nextErrors = submitSearch();
    if (nextErrors) {
      setErrors(nextErrors);
      return;
    }
    navigate("/hotels/results");
  }

  return (
    <div className="container-page py-10">
      <HotelStepper current="Search" />
      <div className="mb-6 space-y-3">
        <h1 className="font-display text-4xl font-bold">Hotels</h1>
        <p className="text-muted-foreground">Search sample stays by city and travel dates.</p>
        <SampleStayNotice />
      </div>
      <HotelSearchForm
        search={draft.search}
        errors={errors}
        onChange={setSearch}
        onSubmit={onSubmit}
      />
    </div>
  );
}
