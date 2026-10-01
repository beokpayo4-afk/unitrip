import { registerModuleBooking } from "@/bookings/registerModuleBooking";

const STORAGE_KEY = "unitrip_flight_bookings";

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listFlightBookings() {
  return readAll();
}

export function getFlightBooking(reference) {
  return readAll().find((booking) => booking.reference === reference) || null;
}

export async function saveFlightBooking(booking) {
  const saved = await registerModuleBooking("flight", booking);
  const record = { ...booking, reference: saved.reference || booking.reference };
  const next = [record, ...readAll().filter((item) => item.reference !== record.reference)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 30)));
  return record;
}

export function createReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let body = "";
  for (const value of bytes) body += alphabet[value % alphabet.length];
  return `UT${body}`;
}

export function downloadBookingFile(booking) {
  const lines = [
    "UNITRIP flight reservation",
    "Sample booking — payment was not collected.",
    "",
    `Reference: ${booking.reference}`,
    `Status: ${booking.statusLabel}`,
    `Amount: INR ${booking.fare.total}`,
    `Saved: ${booking.createdAt}`,
    "",
    "Passengers:",
    ...booking.passengers.map(
      (passenger, index) =>
        `${index + 1}. ${passenger.title} ${passenger.firstName} ${passenger.lastName} (${passenger.type})`
    ),
    "",
    "Flights:",
    ...booking.offer.legs.flatMap((leg) =>
      leg.segments.map(
        (item) =>
          `${item.flightNumber} ${item.from.code} ${item.departTime} → ${item.to.code} ${item.arriveTime} on ${leg.date}`
      )
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${booking.reference}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
