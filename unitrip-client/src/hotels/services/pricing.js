export function quoteStay(pricePerNight, nights, rooms) {
  const base = pricePerNight * nights * Number(rooms);
  const taxes = Math.round(base * 0.12);
  const fees = 149 * Number(rooms);
  return {
    currency: "INR",
    pricePerNight,
    nights,
    rooms: Number(rooms),
    base,
    taxes,
    fees,
    total: base + taxes + fees,
  };
}
