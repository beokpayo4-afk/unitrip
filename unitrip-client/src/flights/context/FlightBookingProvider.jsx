import { useMemo, useState } from "react";
import { flightService } from "@/services/flightService";
import { notificationService } from "@/services/notificationService";
import { paymentService } from "@/services/paymentService";
import { createReference } from "../services/flightBookings";
import { localISODate } from "../utils/time";
import { blankPassengers } from "../validation/passengers";
import { validateSearch } from "../validation/flightSearch";
import { FlightBookingContext } from "./bookingContext";

const DRAFT_KEY = "unitrip_flight_draft";

function defaultSearch() {
  const departureDate = localISODate(7);
  const returnDate = localISODate(14);
  return {
    tripType: "oneway",
    from: "DEL",
    to: "BOM",
    departureDate,
    returnDate,
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: "economy",
    segments: [
      { from: "DEL", to: "BOM", date: departureDate },
      { from: "BOM", to: "BLR", date: returnDate },
    ],
  };
}

function defaultDraft() {
  return {
    search: defaultSearch(),
    searched: false,
    result: null,
    selectedOffer: null,
    passengers: blankPassengers(defaultSearch()),
  };
}

function loadDraft() {
  const base = defaultDraft();
  try {
    const raw = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
    if (!raw || typeof raw !== "object") return base;
    const search = { ...base.search, ...(raw.search || {}) };
    return {
      ...base,
      ...raw,
      search,
      passengers: Array.isArray(raw.passengers) ? raw.passengers : blankPassengers(search),
    };
  } catch {
    return base;
  }
}

export function FlightBookingProvider({ children }) {
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
      const errors = validateSearch(draft.search);
      if (Object.keys(errors).length > 0) return errors;
      const result = await flightService.search(draft.search);
      write({
        ...draft,
        searched: true,
        result,
        selectedOffer: null,
        passengers: blankPassengers(draft.search),
      });
      return null;
    }

    async function completeBooking() {
      const offer = draft.selectedOffer;
      if (!offer) return null;
      const payment = await paymentService.createBooking({
        amount: offer.price.total,
        currency: offer.price.currency,
        product: "flight",
      });
      const saved = await flightService.createBooking({
        reference: createReference(),
        status: "payment_pending",
        statusLabel: "Payment pending — no charge made",
        payment,
        createdAt: new Date().toISOString(),
        search: draft.search,
        offer,
        passengers: draft.passengers,
        fare: offer.price,
      });
      await notificationService.createBooking({
        product: "flight",
        reference: saved.reference,
        email: draft.passengers?.[0]?.email || "",
        title: "Flight request saved",
      });
      return saved;
    }

    function selectOffer(offer) {
      write({ ...draft, selectedOffer: offer });
    }

    function setPassengers(passengers) {
      write({ ...draft, passengers });
    }

    return { draft, setSearch, submitSearch, selectOffer, setPassengers, completeBooking };
  }, [draft]);

  return (
    <FlightBookingContext.Provider value={api}>{children}</FlightBookingContext.Provider>
  );
}
