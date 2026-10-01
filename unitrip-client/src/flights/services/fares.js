export const TRAVEL_CLASSES = [
  { value: "economy", label: "Economy" },
  { value: "premium", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

const CLASS_MULTIPLIER = {
  economy: 1,
  premium: 1.55,
  business: 2.7,
  first: 4,
};

const CHECKIN_EXTRA_KG = {
  economy: 0,
  premium: 5,
  business: 15,
  first: 25,
};

export function classLabel(value) {
  return TRAVEL_CLASSES.find((item) => item.value === value)?.label || value;
}

export function baggageFor(routeMinutes, travelClass) {
  const domestic = routeMinutes < 200;
  const cabin = travelClass === "economy" || travelClass === "premium" ? 7 : 10;
  const checkInBase = domestic ? 15 : 23;
  return {
    cabin: `${cabin} kg`,
    checkIn: `${checkInBase + (CHECKIN_EXTRA_KG[travelClass] || 0)} kg`,
  };
}

export function quoteItinerary(legs, criteria) {
  const multiplier = CLASS_MULTIPLIER[criteria.travelClass] || 1;
  const adultBase = legs.reduce((sum, leg) => sum + leg.baseFare, 0) * multiplier;
  const base = Math.round(
    adultBase * Number(criteria.adults) +
      adultBase * 0.75 * Number(criteria.children) +
      adultBase * 0.1 * Number(criteria.infants)
  );
  const taxes = Math.round(base * 0.18);
  const fees = 199 + Math.max(0, legs.length - 1) * 75;
  return {
    currency: "INR",
    base,
    taxes,
    fees,
    total: base + taxes + fees,
  };
}

export function sampleCancellation(refundable) {
  if (refundable) {
    return "Sample rule only: this demo fare can be cancelled up to 24 hours before departure for a sample fee of ₹1,500 per passenger. This is not a live airline policy.";
  }
  return "Sample rule only: this demo fare is non-refundable and cannot be changed. This is not a live airline policy.";
}
