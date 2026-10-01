import { useMemo, useState } from "react";
import { localISODate } from "../utils/dates";
import { searchHotels } from "../services/hotelSearch";
import { validateHotelSearch } from "../validation/hotelSearch";
import { emptyGuest } from "../validation/guest";
import { HotelBookingContext } from "./bookingContext";

const DRAFT_KEY = "unitrip_hotel_draft";

function defaultSearch() {
  return {
    destination: "Delhi",
    checkIn: localISODate(7),
    checkOut: localISODate(9),
    rooms: 1,
    adults: 2,
    children: 0,
  };
}

function defaultDraft() {
  const search = defaultSearch();
  return {
    search,
    searched: false,
    result: null,
    selectedHotelId: null,
    selectedRoomId: null,
    guest: emptyGuest(search),
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
      guest: { ...emptyGuest(search), ...(raw.guest || {}) },
    };
  } catch {
    return base;
  }
}

export function HotelBookingProvider({ children }) {
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

    function submitSearch() {
      const errors = validateHotelSearch(draft.search);
      if (Object.keys(errors).length > 0) return errors;
      write({
        ...draft,
        searched: true,
        result: searchHotels(draft.search),
        selectedHotelId: null,
        selectedRoomId: null,
        guest: emptyGuest(draft.search),
      });
      return null;
    }

    function selectHotel(hotelId) {
      write({ ...draft, selectedHotelId: hotelId, selectedRoomId: null });
    }

    function selectRoom(hotelId, roomId) {
      write({ ...draft, selectedHotelId: hotelId, selectedRoomId: roomId });
    }

    function setGuest(guest) {
      write({ ...draft, guest });
    }

    return { draft, setSearch, submitSearch, selectHotel, selectRoom, setGuest };
  }, [draft]);

  return <HotelBookingContext.Provider value={api}>{children}</HotelBookingContext.Provider>;
}
