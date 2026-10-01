import { registerModuleBooking } from "@/bookings/registerModuleBooking";

const STORAGE_KEY = "unitrip_hotel_bookings";

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listHotelBookings() {
  return readAll();
}

export function getHotelBooking(reference) {
  return readAll().find((booking) => booking.reference === reference) || null;
}

export async function saveHotelBooking(booking) {
  const saved = await registerModuleBooking("hotel", booking);
  const record = { ...booking, reference: saved.reference || booking.reference };
  const next = [record, ...readAll().filter((item) => item.reference !== record.reference)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 30)));
  return record;
}

export function createHotelReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let body = "";
  for (const value of bytes) body += alphabet[value % alphabet.length];
  return `UH${body}`;
}

export function downloadHotelBooking(booking) {
  const lines = [
    "UNITRIP hotel reservation",
    "Sample booking — payment was not collected.",
    "",
    `Hotel booking ID: ${booking.reference}`,
    `Status: ${booking.statusLabel}`,
    `Hotel: ${booking.hotel.name}, ${booking.hotel.area}, ${booking.hotel.city}`,
    `Room: ${booking.room.name}`,
    `Check-in: ${booking.search.checkIn}`,
    `Check-out: ${booking.search.checkOut}`,
    `Guest: ${booking.guest.name}`,
    `Email: ${booking.guest.email}`,
    `Mobile: ${booking.guest.mobile}`,
    `Guests: ${booking.guest.guests}`,
    `Amount: INR ${booking.fare.total}`,
    booking.guest.requests ? `Requests: ${booking.guest.requests}` : "",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${booking.reference}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
