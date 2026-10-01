import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTrainBooking } from "@/trains/context/bookingContext";
import { SampleTrainNotice } from "@/trains/components/SampleTrainNotice";
import { TrainCard } from "@/trains/components/TrainCard";
import { TrainFilters } from "@/trains/components/TrainFilters";
import { TrainStepper } from "@/trains/components/TrainStepper";
import { EMPTY_FILTERS, filterTrains } from "@/trains/services/filterTrains";

const EMPTY_TRAINS = [];

export default function TrainResultsPage() {
  const { draft, selectTrain } = useTrainBooking();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const trains = draft.result?.trains ?? EMPTY_TRAINS;
  const visible = useMemo(
    () => filterTrains(trains, filters, draft.search.class),
    [trains, filters, draft.search.class]
  );

  if (!draft.searched) return <Navigate to="/trains" replace />;

  return (
    <div className="container-page py-10">
      <TrainStepper current="Results" />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold">Train results</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {visible.length} sample {visible.length === 1 ? "train" : "trains"}
          </p>
        </div>
        <Link to="/trains" className="text-sm font-semibold text-primary">
          Edit search
        </Link>
      </div>
      <SampleTrainNotice>{draft.result?.disclaimer}</SampleTrainNotice>
      <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <TrainFilters
          trains={trains}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
        <div className="space-y-4">
          {trains.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
              No sample trains run between these stations on this date. Try New Delhi to Mumbai Central.
            </p>
          ) : visible.length === 0 ? (
            <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
              No sample trains match these filters.
            </p>
          ) : (
            visible.map((train) => (
              <TrainCard
                key={train.id}
                train={train}
                onDetails={(selected) => {
                  selectTrain(selected.id, draft.search.class === "all" ? null : draft.search.class);
                  navigate("/trains/details");
                }}
                onBook={(selected) => {
                  if (draft.search.class === "all") {
                    selectTrain(selected.id, null);
                    navigate("/trains/details");
                    return;
                  }
                  selectTrain(selected.id, draft.search.class);
                  navigate("/trains/passengers");
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
