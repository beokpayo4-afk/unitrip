import { useMemo, useState } from "react";
import { notificationService } from "@/services/notificationService";
import { paymentService } from "@/services/paymentService";
import { trainService } from "@/services/trainService";
import { localISODate } from "../utils/time";
import { quoteTrain } from "../services/pricing";
import { buildSampleBooking } from "../services/trainBookings";
import { selectedJourney } from "../services/trainSearch";
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
      const result = await trainService.search(draft.search);
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

    async function completeBooking() {
      const { train, travelClass } = selectedJourney(draft);
      if (!train || !travelClass) return null;
      const fare = quoteTrain({
        fare: travelClass.fare,
        passengers: draft.passengers.length,
        quota: draft.search.quota,
      });
      const payment = await paymentService.createBooking({
        amount: fare.total,
        currency: fare.currency,
        product: "train",
      });
      const saved = await trainService.createBooking(
        buildSampleBooking({
          payment,
          search: draft.search,
          train: { name: train.name, number: train.number, type: train.type },
          journey: {
            from: train.from.name,
            to: train.to.name,
            departure: train.from.departure,
            arrival: train.to.arrival,
            date: draft.search.journeyDate,
            classCode: travelClass.code,
            quota: draft.search.quota,
          },
          passengers: draft.passengers,
          fare,
        })
      );
      await notificationService.createBooking({
        product: "train",
        reference: saved.reference,
        email: draft.passengers?.[0]?.email || "",
        title: "Train request saved",
      });
      return saved;
    }

    return { draft, setSearch, submitSearch, selectTrain, setPassengers, completeBooking };
  }, [draft]);

  return <TrainBookingContext.Provider value={api}>{children}</TrainBookingContext.Provider>;
}
