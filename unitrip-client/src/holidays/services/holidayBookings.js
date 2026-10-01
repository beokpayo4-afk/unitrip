import { registerModuleBooking } from "@/bookings/registerModuleBooking";
import { HOLIDAY_ENQUIRY } from "../data/options";

const BOOKING_KEY = "unitrip_holiday_bookings";
const ENQUIRY_KEY = "unitrip_holiday_enquiries";

function read(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(key, items) {
  localStorage.setItem(key, JSON.stringify(items.slice(0, 30)));
}

function reference(prefix) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let body = "";
  for (const value of bytes) body += alphabet[value % alphabet.length];
  return `${prefix}${body}`;
}

export async function saveHolidayBooking(booking) {
  const next = { ...booking, reference: reference("HP"), createdAt: new Date().toISOString() };
  const saved = await registerModuleBooking("holiday", next);
  const record = { ...next, reference: saved.reference || next.reference };
  write(BOOKING_KEY, [record, ...read(BOOKING_KEY)]);
  return record;
}

export function listHolidayBookings() {
  return read(BOOKING_KEY);
}

export function getHolidayBooking(id) {
  return read(BOOKING_KEY).find((item) => item.reference === id) || null;
}

export function saveHolidayEnquiry(enquiry) {
  const next = { ...enquiry, reference: reference("HE"), createdAt: new Date().toISOString(), emailed: false };
  write(ENQUIRY_KEY, [next, ...read(ENQUIRY_KEY)]);
  return next;
}

export function whatsappEnquiryUrl(travelPackage) {
  const text = encodeURIComponent(
    `Hello UNITRIP, I would like to enquire about ${travelPackage.name} (${travelPackage.destination}).`
  );
  const number = String(HOLIDAY_ENQUIRY.whatsappNumber || "").replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function downloadHolidayBooking(booking) {
  const lines = [
    "UNITRIP holiday request",
    "Sample booking — the departure is not confirmed.",
    "",
    `Booking ID: ${booking.reference}`,
    `Package: ${booking.packageName}`,
    `Destination: ${booking.destination}`,
    `Dates: ${booking.startDate} to ${booking.endDate}`,
    `Guest: ${booking.name}`,
    `Email: ${booking.email}`,
    `Mobile: ${booking.mobile}`,
    `Adults: ${booking.adults}`,
    `Children: ${booking.children}`,
    `Room: ${booking.room}`,
    `Estimate: INR ${booking.fare.total}`,
    `Status: ${booking.statusLabel}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${booking.reference}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
