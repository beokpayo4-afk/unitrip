import { useMemo, useState } from "react";
import { HolidayBookingContext } from "./bookingContext";
import { notificationService } from "@/services/notificationService";
import { packageService } from "@/services/packageService";
import { getHolidayBooking, listHolidayBookings, saveHolidayEnquiry } from "../services/holidayBookings";
import { quoteHoliday } from "../services/pricing";

const DRAFT_KEY = "unitrip_holiday_draft";

function readDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
}

export function HolidayBookingProvider({ children }) {
  const [draft, setDraftState] = useState(readDraft);
  const [bookings, setBookings] = useState(() => listHolidayBookings());

  const fare = useMemo(() => {
    if (!draft?.travelPackage) return null;
    return quoteHoliday(draft.travelPackage, draft);
  }, [draft]);

  function setDraft(next) {
    setDraftState(next);
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  }

  function clearDraft() {
    setDraftState(null);
    sessionStorage.removeItem(DRAFT_KEY);
  }

  async function confirmBooking() {
    if (!draft?.travelPackage || !fare) return null;
    const saved = await packageService.createBooking({
      packageSlug: draft.travelPackage.slug,
      packageName: draft.travelPackage.name,
      destination: draft.travelPackage.destination,
      durationLabel: draft.travelPackage.durationLabel,
      startDate: draft.startDate,
      endDate: draft.endDate,
      name: draft.name.trim(),
      email: draft.email.trim(),
      mobile: draft.mobile.trim(),
      adults: Number(draft.adults),
      children: Number(draft.children),
      room: draft.room,
      requirements: draft.requirements.trim(),
      fare,
      status: "request_saved",
      statusLabel: "Request saved — departure not confirmed",
      departureConfirmed: false,
    });
    await notificationService.createBooking({
      product: "holiday",
      reference: saved.reference,
      email: saved.email,
      title: "Holiday request saved",
    });
    setBookings(listHolidayBookings());
    clearDraft();
    return saved;
  }

  function submitEnquiry(enquiry) {
    return saveHolidayEnquiry(enquiry);
  }

  const value = {
    draft,
    fare,
    bookings,
    setDraft,
    clearDraft,
    confirmBooking,
    submitEnquiry,
    findBooking: getHolidayBooking,
  };

  return <HolidayBookingContext.Provider value={value}>{children}</HolidayBookingContext.Provider>;
}
