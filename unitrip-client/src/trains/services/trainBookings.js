import { registerModuleBooking } from "@/bookings/registerModuleBooking";

const STORAGE_KEY = "unitrip_train_bookings";

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function listTrainBookings() {
  return readAll();
}

export function getTrainBooking(reference) {
  return readAll().find((booking) => booking.reference === reference) || null;
}

export async function saveTrainBooking(booking) {
  const saved = await registerModuleBooking("train", booking);
  const record = { ...booking, reference: saved.reference || booking.reference };
  const next = [record, ...readAll().filter((item) => item.reference !== record.reference)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 30)));
  return record;
}

export function createTrainReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let body = "";
  for (const value of bytes) body += alphabet[value % alphabet.length];
  return `TR${body}`;
}

/**
 * Sample booking record. `pnr` stays null until a real railway adapter issues one.
 */
export function buildSampleBooking(payload) {
  return {
    ...payload,
    reference: createTrainReference(),
    pnr: null,
    pnrStatus: "not_issued",
    seatConfirmed: false,
    status: "payment_pending",
    statusLabel: "Payment pending — no seat reserved",
    createdAt: new Date().toISOString(),
  };
}

export function downloadTrainBooking(booking) {
  const lines = [
    "UNITRIP train reservation",
    "Sample booking — no PNR was issued and no railway seat was booked.",
    "",
    `Train booking ID: ${booking.reference}`,
    "PNR: not issued",
    `Status: ${booking.statusLabel}`,
    `Train: ${booking.train.name} (${booking.train.number})`,
    `Journey: ${booking.journey.from} to ${booking.journey.to} on ${booking.journey.date}`,
    `Class: ${booking.journey.classCode}`,
    `Quota: ${booking.journey.quota}`,
    `Amount: INR ${booking.fare.total}`,
    "",
    "Passengers:",
    ...booking.passengers.map(
      (passenger, index) =>
        `${index + 1}. ${passenger.name}, ${passenger.age}, ${passenger.gender}, ${passenger.berth}`
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
