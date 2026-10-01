import { api } from "@/api/client";

function lastSegment(booking) {
  const legs = booking.offer?.legs || [];
  const segments = legs[legs.length - 1]?.segments || [];
  return segments[segments.length - 1] || null;
}

export function moduleBookingPayload(type, booking) {
  if (type === "flight") {
    const passenger = booking.passengers?.[0];
    const segment = lastSegment(booking);
    return {
      type,
      reference: booking.reference,
      customerName: passenger ? `${passenger.firstName} ${passenger.lastName}`.trim() : "",
      email: passenger?.email || "",
      phone: passenger?.mobile || "",
      destination: segment?.to?.city || segment?.to?.code || "",
      travelDate: booking.offer?.legs?.[0]?.date || booking.search?.departDate || "",
      amount: Number(booking.fare?.total) || 0,
      currency: booking.fare?.currency || "INR",
      details: booking,
    };
  }
  if (type === "hotel") {
    return {
      type,
      reference: booking.reference,
      customerName: booking.guest?.name || "",
      email: booking.guest?.email || "",
      phone: booking.guest?.mobile || "",
      destination: booking.hotel?.city || booking.hotel?.name || "",
      travelDate: booking.search?.checkIn || "",
      amount: Number(booking.fare?.total) || 0,
      currency: booking.fare?.currency || "INR",
      details: booking,
    };
  }
  if (type === "train") {
    const passenger = booking.passengers?.[0];
    return {
      type,
      reference: booking.reference,
      customerName: passenger?.name || "",
      email: "",
      phone: "",
      destination: booking.journey?.to || "",
      travelDate: booking.journey?.date || "",
      amount: Number(booking.fare?.total) || 0,
      currency: booking.fare?.currency || "INR",
      details: booking,
    };
  }
  return {
    type: "holiday",
    reference: booking.reference,
    customerName: booking.name || "",
    email: booking.email || "",
    phone: booking.mobile || "",
    destination: booking.destination || "",
    travelDate: booking.startDate || "",
    amount: Number(booking.fare?.total) || 0,
    currency: "INR",
    details: booking,
  };
}

export async function registerModuleBooking(type, booking) {
  return api("/api/module-bookings", {
    method: "POST",
    body: JSON.stringify(moduleBookingPayload(type, booking)),
  });
}
