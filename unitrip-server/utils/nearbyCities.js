/**
 * Day-trip / NCR neighbors used when browsing a city with nearby=1.
 * Keys are lowercase city names.
 */
const NEARBY_BY_CITY = {
  delhi: ["Gurugram", "Gurgaon", "Noida", "Faridabad", "Ghaziabad", "Agra", "Mathura", "Jaipur"],
  gurugram: ["Delhi", "Gurgaon", "Noida", "Faridabad"],
  gurgaon: ["Delhi", "Gurugram", "Noida", "Faridabad"],
  noida: ["Delhi", "Gurugram", "Gurgaon", "Ghaziabad"],
  agra: ["Delhi", "Mathura", "Fatehpur Sikri"],
  jaipur: ["Delhi", "Agra", "Ajmer"],
  mumbai: ["Pune", "Lonavala"],
  goa: ["Dudhsagar"],
  dubai: ["Abu Dhabi", "Sharjah"],
  bangkok: ["Pattaya", "Ayutthaya"],
  singapore: ["Johor Bahru"],
};

export function nearbyCitiesFor(city) {
  if (!city || typeof city !== "string") return [];
  return NEARBY_BY_CITY[city.trim().toLowerCase()] || [];
}

/** Primary city plus its nearby cities (deduped, case-preserved from inputs). */
export function citiesWithNearby(city) {
  const primary = city.trim();
  const nearby = nearbyCitiesFor(primary);
  const seen = new Set();
  const out = [];
  for (const name of [primary, ...nearby]) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}
