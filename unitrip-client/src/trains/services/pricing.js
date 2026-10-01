export function quoteTrain({ fare, passengers, quota }) {
  const count = Math.max(1, Number(passengers) || 1);
  const base = fare * count;
  const reservation = 40 * count;
  const taxes = Math.round((base + reservation) * 0.05);
  const fees = (quota === "tatkal" ? 80 : 20) * count;
  return {
    currency: "INR",
    passengers: count,
    fareEach: fare,
    base,
    reservation,
    taxes,
    fees,
    total: base + reservation + taxes + fees,
  };
}
