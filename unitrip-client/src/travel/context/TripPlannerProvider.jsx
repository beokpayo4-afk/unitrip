import { useState } from "react";
import { TripPlannerContext } from "./plannerContext";
import { EMPTY_TRIP_REQUEST } from "../data/options";

const DRAFT_KEY = "unitrip_trip_draft";

function readDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
    if (!saved || typeof saved !== "object") return EMPTY_TRIP_REQUEST;
    return { ...EMPTY_TRIP_REQUEST, ...saved, tripTypes: saved.tripTypes || [], interests: saved.interests || [], transport: saved.transport || [] };
  } catch {
    return EMPTY_TRIP_REQUEST;
  }
}

export function TripPlannerProvider({ children }) {
  const [draft, setDraft] = useState(readDraft);

  function updateDraft(partial) {
    setDraft((current) => {
      const next = { ...current, ...partial };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearDraft() {
    sessionStorage.removeItem(DRAFT_KEY);
    setDraft(EMPTY_TRIP_REQUEST);
  }

  return (
    <TripPlannerContext.Provider value={{ draft, updateDraft, clearDraft }}>
      {children}
    </TripPlannerContext.Provider>
  );
}
