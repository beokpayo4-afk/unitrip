import { timeBucket } from "../utils/time";

export const EMPTY_FILTERS = {
  departBuckets: [],
  arriveBuckets: [],
  types: [],
  classes: [],
  priceMin: "",
  priceMax: "",
  maxDuration: "any",
};

function relevantFare(train, filters, searchedClass) {
  const wanted = filters.classes.length
    ? filters.classes
    : searchedClass !== "all"
      ? [searchedClass]
      : train.classes.map((item) => item.code);
  const fares = train.classes.filter((item) => wanted.includes(item.code)).map((item) => item.fare);
  if (fares.length === 0) return null;
  return Math.min(...fares);
}

export function filterTrains(trains, filters, searchedClass) {
  return trains.filter((train) => {
    if (filters.types.length > 0 && !filters.types.includes(train.type)) return false;
    if (
      filters.classes.length > 0 &&
      !filters.classes.some((code) => train.classes.some((item) => item.code === code))
    ) {
      return false;
    }
    if (filters.departBuckets.length > 0 && !filters.departBuckets.includes(timeBucket(train.from.departure))) {
      return false;
    }
    if (filters.arriveBuckets.length > 0 && !filters.arriveBuckets.includes(timeBucket(train.to.arrival))) {
      return false;
    }
    const fare = relevantFare(train, filters, searchedClass);
    if (fare === null) return false;
    if (filters.priceMin !== "" && fare < Number(filters.priceMin)) return false;
    if (filters.priceMax !== "" && fare > Number(filters.priceMax)) return false;
    if (filters.maxDuration !== "any" && train.durationMinutes > Number(filters.maxDuration)) return false;
    return true;
  });
}
