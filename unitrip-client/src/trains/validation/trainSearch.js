import { STATIONS } from "../data/stations";
import { QUOTAS, TRAVEL_CLASSES } from "../data/classes";

export function validateTrainSearch(search) {
  const errors = {};
  if (!STATIONS.some((station) => station.code === search.from)) errors.from = "Choose a departure station.";
  if (!STATIONS.some((station) => station.code === search.to)) errors.to = "Choose an arrival station.";
  if (search.from && search.from === search.to) errors.to = "From and To must be different.";
  if (!search.journeyDate) errors.journeyDate = "Choose a journey date.";
  if (!TRAVEL_CLASSES.some((item) => item.value === search.class)) errors.class = "Choose a class.";
  if (!QUOTAS.some((item) => item.value === search.quota)) errors.quota = "Choose a quota.";
  return errors;
}
