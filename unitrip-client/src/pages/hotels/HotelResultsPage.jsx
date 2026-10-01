import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useHotelBooking } from "@/hotels/context/bookingContext";
import { HotelCard } from "@/hotels/components/HotelCard";
import { HotelFilters } from "@/hotels/components/HotelFilters";
import { HotelStepper } from "@/hotels/components/HotelStepper";
import { SampleStayNotice } from "@/hotels/components/SampleStayNotice";
import { EMPTY_FILTERS, SORT_OPTIONS, displayRoom, filterAndSortHotels } from "@/hotels/services/filterHotels";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

const EMPTY_HOTELS = [];

export default function HotelResultsPage() {
  const { draft, selectHotel } = useHotelBooking();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("recommended");

  const hotels = draft.result?.hotels ?? EMPTY_HOTELS;
  const visible = useMemo(
    () => filterAndSortHotels(hotels, filters, sort),
    [hotels, filters, sort]
  );

  if (!draft.searched) return <Navigate to="/hotels" replace />;

  return (
    <div className="container-page py-10">
      <HotelStepper current="Results" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold">Hotel results</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {visible.length} sample {visible.length === 1 ? "stay" : "stays"} in {draft.search.destination}
          </p>
        </div>
        <Link to="/hotels" className="text-sm font-semibold text-primary">
          Edit search
        </Link>
      </div>
      <SampleStayNotice>{draft.result?.disclaimer}</SampleStayNotice>
      <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <HotelFilters
          hotels={hotels}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label htmlFor="sort">Sort</Label>
            <SelectNative
              id="sort"
              className="w-full sm:w-56"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectNative>
          </div>
          {hotels.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
              No sample stays in {draft.search.destination} for this party. Try Delhi, Mumbai, Goa, Jaipur, or Udaipur.
            </p>
          ) : visible.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
              No sample stays match these filters.
            </p>
          ) : (
            visible.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                room={displayRoom(hotel, filters)}
                onDetails={(selected) => {
                  selectHotel(selected.id);
                  navigate("/hotels/details");
                }}
                onSelectRoom={(selected) => {
                  selectHotel(selected.id);
                  navigate("/hotels/rooms");
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
