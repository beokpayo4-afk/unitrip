import { stationByCode } from "../data/stations";
import { SAMPLE_TRAINS, SAMPLE_RULES } from "../data/trains";
import { CLASS_ORDER, adjustedFare } from "../data/classes";
import { minutesBetween, weekdayOf } from "../utils/time";

export const TRAIN_DATA_SOURCE = "mock";

export const SAMPLE_DISCLAIMER =
  "Sample timetable for the UNITRIP demo. This is not a live Indian Railways enquiry, and availability is not a real seat.";

function availabilityKind(text) {
  if (text.startsWith("Available")) return "available";
  if (text.startsWith("WL")) return "wl";
  if (text.startsWith("RAC")) return "rac";
  return "other";
}

export function segmentOf(train, fromCode, toCode) {
  const fromIndex = train.route.findIndex((stop) => stop.code === fromCode);
  const toIndex = train.route.findIndex((stop) => stop.code === toCode);
  if (fromIndex < 0 || toIndex <= fromIndex) return null;
  const from = train.route[fromIndex];
  const to = train.route[toIndex];
  return {
    from,
    to,
    durationMinutes: minutesBetween(from.departure, from.day, to.arrival, to.day),
    dayOffset: to.day - from.day,
    via: train.route.slice(fromIndex, toIndex + 1),
  };
}

function present(train, criteria, segment) {
  const classes = CLASS_ORDER.filter((code) => train.classes[code]).map((code) => {
    const item = train.classes[code];
    return {
      code,
      baseFare: item.fare,
      fare: adjustedFare(item.fare, criteria.quota),
      availability: item.availability,
      availabilityKind: availabilityKind(item.availability),
    };
  });
  return {
    id: train.id,
    number: train.number,
    name: train.name,
    type: train.type,
    runningDays: train.runningDays,
    from: {
      ...segment.from,
      ...stationByCode(segment.from.code),
    },
    to: {
      ...segment.to,
      ...stationByCode(segment.to.code),
    },
    durationMinutes: segment.durationMinutes,
    dayOffset: segment.dayOffset,
    route: train.route.map((stop) => ({ ...stop, ...stationByCode(stop.code) })),
    classes,
    rules: SAMPLE_RULES,
    quota: criteria.quota,
  };
}

export function selectedJourney(draft) {
  const train = draft.result?.trains?.find((item) => item.id === draft.selectedTrainId) || null;
  const travelClass = train?.classes.find((item) => item.code === draft.selectedClass) || null;
  return { train, travelClass };
}

export function findTrains(criteria) {
  const weekday = weekdayOf(criteria.journeyDate);
  return SAMPLE_TRAINS.flatMap((train) => {
    if (!train.runningDays.includes(weekday)) return [];
    if (criteria.class !== "all" && !train.classes[criteria.class]) return [];
    const segment = segmentOf(train, criteria.from, criteria.to);
    if (!segment) return [];
    return [present(train, criteria, segment)];
  });
}
