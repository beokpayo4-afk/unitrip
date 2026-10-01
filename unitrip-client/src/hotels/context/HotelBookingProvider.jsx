import { useMemo, useState } from "react";
import { hotelService } from "@/services/hotelService";
import { notificationService } from "@/services/notificationService";
import { paymentService } from "@/services/paymentService";
import { localISODate } from "../utils/dates";
import { createHotelReference } from "../services/hotelBookings";
import { selectedStay } from "../services/hotelSearch";
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

    async function submitSearch() {
      const errors = validateHotelSearch(draft.search);
      if (Object.keys(errors).length > 0) return errors;
      const result = await hotelService.search(draft.search);
      write({
        ...draft,
        searched: true,
        result,
        selectedHotelId: null,
        selectedRoomId: null,
        guest: emptyGuest(draft.search),
      });
      return null;
    }

    async function completeBooking() {
      const { hotel, room } = selectedStay(draft);
      if (!hotel || !room) return null;
      const payment = await paymentService.createBooking({
        amount: room.price.total,
        currency: room.price.currency,
        product: "hotel",
      });
      const saved = await hotelService.createBooking({
        reference: createHotelReference(),
        status: "payment_pending",
        statusLabel: "Payment pending — no charge made",
        payment,
        createdAt: new Date().toISOString(),
        search: draft.search,
        hotel: {
          id: hotel.id,
          name: hotel.name,
          city: hotel.city,
          area: hotel.area,
          stars: hotel.stars,
        },
        room: {
          id: room.id,
          name: room.name,
          bedType: room.bedType,
          meals: room.meals,
          cancellation: room.cancellation,
        },
        guest: draft.guest,
        fare: room.price,
      });
      await notificationService.createBooking({
        product: "hotel",
        reference: saved.reference,
        email: draft.guest?.email || "",
        title: "Hotel request saved",
      });
      return saved;
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

    return { draft, setSearch, submitSearch, selectHotel, selectRoom, setGuest, completeBooking };
  }, [draft]);

  return <HotelBookingContext.Provider value={api}>{children}</HotelBookingContext.Provider>;
}
