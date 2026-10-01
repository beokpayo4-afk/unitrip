import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useFlightBooking } from "@/flights/context/bookingContext";
import { EMPTY_FILTERS, SORT_OPTIONS, filterAndSortOffers } from "@/flights/services/filterOffers";
import { passengerCount } from "@/flights/services/flightSearch";
import { FlightCard } from "@/flights/components/FlightCard";
import { FlightFilters } from "@/flights/components/FlightFilters";
import { FlightStepper } from "@/flights/components/FlightStepper";
import { SampleDataNotice } from "@/flights/components/SampleDataNotice";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

const EMPTY_OFFERS = [];

export default function FlightResultsPage() {
  const { draft, selectOffer } = useFlightBooking();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("cheapest");

  const offers = draft.result?.offers ?? EMPTY_OFFERS;
  const visible = useMemo(
    () => filterAndSortOffers(offers, filters, sort),
    [offers, filters, sort]
  );

  if (!draft.searched) return <Navigate to="/flights" replace />;

  const travellers = passengerCount(draft.search);

  return (
    <div className="container-page py-10">
      <FlightStepper current="Results" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold">Flight results</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {visible.length} sample {visible.length === 1 ? "itinerary" : "itineraries"}
          </p>
        </div>
        <Link to="/flights" className="text-sm font-semibold text-primary">
          Edit search
        </Link>
      </div>
      <SampleDataNotice>{draft.result?.disclaimer}</SampleDataNotice>

      <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <FlightFilters
          offers={offers}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label htmlFor="sort">Sort</Label>
            <SelectNative id="sort" className="w-full sm:w-56" value={sort} onChange={(event) => setSort(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectNative>
          </div>
          {offers.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
              No sample itineraries for this route. Try Delhi to Mumbai, or another city pair in the search list.
            </p>
          ) : visible.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
              No sample flights match these filters.
            </p>
          ) : (
            visible.map((offer) => (
              <FlightCard
                key={offer.id}
                offer={offer}
                travellerCount={travellers}
                onSelect={(selected) => {
                  selectOffer(selected);
                  navigate("/flights/details");
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
