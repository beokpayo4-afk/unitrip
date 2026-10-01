export function quoteHoliday(travelPackage, { adults, children }) {
  const adultCount = Number(adults) || 0;
  const childCount = Number(children) || 0;
  const base = travelPackage.startingPrice * adultCount + Math.round(travelPackage.startingPrice * 0.7 * childCount);
  const taxes = Math.round(base * 0.05);
  const fees = 499;
  return {
    currency: "INR",
    startingPrice: travelPackage.startingPrice,
    adults: adultCount,
    children: childCount,
    base,
    taxes,
    fees,
    total: base + taxes + fees,
  };
}
