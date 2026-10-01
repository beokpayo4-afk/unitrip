import { airlineByCode } from "../data/airlines";
import { airportByCode, isInternationalRoute } from "../data/airports";
import { HUBS, SCHEDULE_PATTERNS, findSampleRoute } from "../data/routes";
import { baggageFor, quoteItinerary, sampleCancellation } from "./fares";
import { addMinutes } from "../utils/time";

export const FLIGHT_DATA_SOURCE = "mock";

export const SAMPLE_DISCLAIMER =
  "These are sample itineraries for the UNITRIP demo. They are not live airline availability, and selecting one does not hold a real seat.";

function hubsFor(from, to, count) {
  const pool = HUBS.filter((code) => code !== from && code !== to);
  const chosen = [];
  for (let i = 0; i < count; i += 1) {
    chosen.push(pool[i % pool.length]);
  }
  return chosen;
}

function segment({ airlineCode, flightNumber, from, to, departTime, durationMinutes, dayOffset }) {
  const arrival = addMinutes(departTime, durationMinutes);
  return {
    airline: airlineByCode(airlineCode),
    flightNumber,
    from: airportByCode(from),
    to: airportByCode(to),
    departTime,
    arriveTime: arrival.time,
    departDayOffset: dayOffset,
    arriveDayOffset: dayOffset + arrival.dayOffset,
    durationMinutes,
  };
}

function buildLeg({ from, to, date, pattern, route, travelClass, reversed }) {
  const airlineCode = pattern.airline;
  const flightBase = pattern.number + (reversed ? 17 : 0);
  const stops = route.minutes >= 180 ? pattern.stops : Math.min(pattern.stops, 1);
  const hubs = hubsFor(from, to, stops);
  const points = [from, ...hubs, to];
  const segments = [];
  let cursor = pattern.depart;
  let dayOffset = 0;
  const nonstop = route.minutes;

  if (stops === 0) {
    segments.push(
      segment({
        airlineCode,
        flightNumber: `${airlineCode} ${flightBase}`,
        from,
        to,
        departTime: cursor,
        durationMinutes: nonstop,
        dayOffset,
      })
    );
  } else {
    const hop = Math.round(nonstop / (stops + 1));
    for (let i = 0; i < stops + 1; i += 1) {
      const durationMinutes = i === stops ? hop + 25 : hop;
      const built = segment({
        airlineCode,
        flightNumber: `${airlineCode} ${flightBase + i}`,
        from: points[i],
        to: points[i + 1],
        departTime: cursor,
        durationMinutes,
        dayOffset,
      });
      segments.push(built);
      if (i < stops) {
        const afterLayover = addMinutes(built.arriveTime, 70);
        cursor = afterLayover.time;
        dayOffset = built.arriveDayOffset + afterLayover.dayOffset;
      }
    }
  }

  const durationMinutes = segments.reduce((sum, item, index) => {
    if (index === 0) return item.durationMinutes;
    return sum + 70 + item.durationMinutes;
  }, 0);

  const refundable = pattern.refundable;
  return {
    date,
    from: airportByCode(from),
    to: airportByCode(to),
    durationMinutes,
    stops,
    segments,
    baggage: baggageFor(route.minutes, travelClass),
    refundable,
    cancellation: sampleCancellation(refundable),
    baseFare: route.base,
  };
}

function legsFor(from, to, date, travelClass) {
  const route = findSampleRoute(from, to);
  if (!route || !date) return [];
  const reversed = from !== route.from;
  return SCHEDULE_PATTERNS.filter((pattern) => pattern.stops < 2 || route.minutes >= 180).map(
    (pattern) => buildLeg({ from, to, date, pattern, route, travelClass, reversed })
  );
}

function combine(lists, limit = 12) {
  const offers = [];
  function walk(index, acc) {
    if (offers.length >= limit) return;
    if (index === lists.length) {
      offers.push(acc);
      return;
    }
    for (const item of lists[index]) {
      walk(index + 1, [...acc, item]);
      if (offers.length >= limit) return;
    }
  }
  walk(0, []);
  return offers;
}

function requestedLegs(criteria) {
  if (criteria.tripType === "multicity") {
    return criteria.segments.map((segmentItem) => ({
      from: segmentItem.from,
      to: segmentItem.to,
      date: segmentItem.date,
    }));
  }
  const outbound = {
    from: criteria.from,
    to: criteria.to,
    date: criteria.departureDate,
  };
  if (criteria.tripType === "roundtrip") {
    return [
      outbound,
      { from: criteria.to, to: criteria.from, date: criteria.returnDate },
    ];
  }
  return [outbound];
}

export function searchFlights(criteria) {
  const requested = requestedLegs(criteria);
  const perLeg = requested.map((leg) =>
    legsFor(leg.from, leg.to, leg.date, criteria.travelClass)
  );

  if (perLeg.some((list) => list.length === 0)) {
    return { source: FLIGHT_DATA_SOURCE, disclaimer: SAMPLE_DISCLAIMER, offers: [] };
  }

  const offers = combine(perLeg).map((legs) => {
    const airlineCodes = [
      ...new Set(legs.flatMap((leg) => leg.segments.map((item) => item.airline.code))),
    ];
    const endpointCodes = legs.flatMap((leg) => [leg.from.code, leg.to.code]);
    const refundable = legs.every((leg) => leg.refundable);
    return {
      id: legs
        .map((leg) => `${leg.segments.map((item) => item.flightNumber).join("-")}-${leg.date}`)
        .join("_"),
      tripType: criteria.tripType,
      travelClass: criteria.travelClass,
      legs,
      airlineCodes,
      primaryAirline: legs[0].segments[0].airline,
      refundable,
      cancellation: sampleCancellation(refundable),
      international: isInternationalRoute(endpointCodes),
      price: quoteItinerary(legs, criteria),
    };
  });

  return { source: FLIGHT_DATA_SOURCE, disclaimer: SAMPLE_DISCLAIMER, offers };
}

export function offerDuration(offer) {
  return offer.legs.reduce((sum, leg) => sum + leg.durationMinutes, 0);
}

export function passengerCount(criteria) {
  return Number(criteria.adults) + Number(criteria.children) + Number(criteria.infants);
}
