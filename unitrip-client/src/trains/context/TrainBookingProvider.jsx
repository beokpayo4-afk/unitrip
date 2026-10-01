import { useMemo, useState } from "react";
import { localISODate } from "../utils/time";
import { trainInventory } from "../services/trainInventory";
import { validateTrainSearch } from "../validation/trainSearch";
import { emptyPassenger } from "../validation/passengers";
import { TrainBookingContext } from "./bookingContext";

const DRAFT_KEY = "unitrip_train_draft";

function defaultSearch() {
  return {
    from: "NDLS",
    to: "MMCT",
    journeyDate: localISODate(7),
    class: "all",
    quota: "general",
  };
}

function defaultDraft() {
  return {
    search: defaultSearch(),
    searched: false,
    result: null,
    selectedTrainId: null,
    selectedClass: null,
    passengers: [emptyPassenger()],
  };
}

function loadDraft() {
  const base = defaultDraft();
  try {
    const raw = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
    if (!raw || typeof raw !== "object") return base;
    return {
      ...base,
      ...raw,
      search: { ...base.search, ...(raw.search || {}) },
      passengers: Array.isArray(raw.passengers) && raw.passengers.length ? raw.passengers : base.passengers,
    };
  } catch {
    return base;
  }
}

export function TrainBookingProvider({ children }) {
  const [draft, setDraft] = useState(loadDraft);

  const api = useMemo(() => {
    function write(next) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      setDraft(next);
    }

    function setSearch(updater) {
      const search = typeof updater === "function" ? updater(draft.search) : updater;
      write({ ...draft, search });
    }

    async function submitSearch() {
      const errors = validateTrainSearch(draft.search);
      if (Object.keys(errors).length > 0) return errors;
      const result = await trainInventory.search(draft.search);
      write({
        ...draft,
        searched: true,
        result,
        selectedTrainId: null,
        selectedClass: draft.search.class === "all" ? null : draft.search.class,
        passengers: [emptyPassenger()],
      });
      return null;
    }

    function selectTrain(trainId, classCode) {
      write({
        ...draft,
        selectedTrainId: trainId,
        selectedClass: classCode || null,
      });
    }

    function setPassengers(passengers) {
      write({ ...draft, passengers });
    }

    return { draft, setSearch, submitSearch, selectTrain, setPassengers };
  }, [draft]);

  return <TrainBookingContext.Provider value={api}>{children}</TrainBookingContext.Provider>;
}
