export const EMPTY_FILTERS = {
  destination: "all",
  priceMin: "",
  priceMax: "",
  duration: "any",
  category: "all",
  hotelCategory: "all",
  scope: "all",
};

function durationMatches(nights, duration) {
  if (duration === "short") return nights <= 2;
  if (duration === "medium") return nights >= 3 && nights <= 4;
  if (duration === "long") return nights >= 5;
  return true;
}

export function filterHolidayPackages(packages, filters) {
  return packages.filter((item) => {
    if (filters.destination !== "all" && item.destination !== filters.destination) return false;
    if (filters.scope !== "all" && item.scope !== filters.scope) return false;
    if (filters.priceMin !== "" && item.startingPrice < Number(filters.priceMin)) return false;
    if (filters.priceMax !== "" && item.startingPrice > Number(filters.priceMax)) return false;
    if (!durationMatches(item.durationNights, filters.duration)) return false;
    if (filters.category !== "all" && !item.categories.includes(filters.category)) return false;
    if (filters.hotelCategory !== "all" && item.hotelCategory !== filters.hotelCategory) return false;
    return true;
  });
}

export function holidayDestinations(packages) {
  return [...new Set(packages.map((item) => item.destination))];
}
