import { offerDuration } from "./flightSearch";
import { timeBucket } from "../utils/time";

export const SORT_OPTIONS = [
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest" },
  { value: "earliest", label: "Earliest departure" },
];

export const EMPTY_FILTERS = {
  priceMin: "",
  priceMax: "",
  airlines: [],
  stops: "any",
  departBuckets: [],
  arriveBuckets: [],
  maxDuration: "any",
};

export function filterAndSortOffers(offers, filters, sort) {
  const list = offers.filter((offer) => {
    const price = offer.price.total;
    if (filters.priceMin !== "" && price < Number(filters.priceMin)) return false;
    if (filters.priceMax !== "" && price > Number(filters.priceMax)) return false;
    if (
      filters.airlines.length > 0 &&
      !filters.airlines.some((code) => offer.airlineCodes.includes(code))
    ) {
      return false;
    }
    if (filters.stops !== "any") {
      const wanted = Number(filters.stops);
      const matches = offer.legs.every((leg) =>
        wanted >= 2 ? leg.stops >= 2 : leg.stops === wanted
      );
      if (!matches) return false;
    }
    const depart = offer.legs[0].segments[0].departTime;
    const lastLeg = offer.legs[offer.legs.length - 1];
    const arrive = lastLeg.segments[lastLeg.segments.length - 1].arriveTime;
    if (
      filters.departBuckets.length > 0 &&
      !filters.departBuckets.includes(timeBucket(depart))
    ) {
      return false;
    }
    if (
      filters.arriveBuckets.length > 0 &&
      !filters.arriveBuckets.includes(timeBucket(arrive))
    ) {
      return false;
    }
    if (filters.maxDuration !== "any" && offerDuration(offer) > Number(filters.maxDuration)) {
      return false;
    }
    return true;
  });

  const sorted = [...list];
  if (sort === "fastest") {
    sorted.sort((a, b) => offerDuration(a) - offerDuration(b));
  } else if (sort === "earliest") {
    sorted.sort((a, b) =>
      a.legs[0].segments[0].departTime.localeCompare(b.legs[0].segments[0].departTime)
    );
  } else {
    sorted.sort((a, b) => a.price.total - b.price.total);
  }
  return sorted;
}
