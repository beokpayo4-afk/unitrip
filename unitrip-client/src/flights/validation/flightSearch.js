import { airportByCode } from "../data/airports";

function airportError(code, label) {
  if (!code || !airportByCode(code)) return `Choose a ${label} airport.`;
  return "";
}

export function validateSearch(search) {
  const errors = {};

  const adults = Number(search.adults);
  const children = Number(search.children);
  const infants = Number(search.infants);
  if (!Number.isInteger(adults) || adults < 1 || adults > 9) {
    errors.adults = "Add at least 1 adult (maximum 9).";
  }
  if (!Number.isInteger(children) || children < 0 || children > 6) {
    errors.children = "Children must be between 0 and 6.";
  }
  if (!Number.isInteger(infants) || infants < 0 || infants > adults) {
    errors.infants = "Infants cannot be more than the number of adults.";
  }

  if (search.tripType === "multicity") {
    const segmentErrors = search.segments.map((segment) => {
      const item = {};
      const fromError = airportError(segment.from, "departure");
      const toError = airportError(segment.to, "arrival");
      if (fromError) item.from = fromError;
      if (toError) item.to = toError;
      if (segment.from && segment.from === segment.to) item.to = "From and To must be different.";
      if (!segment.date) item.date = "Choose a date.";
      return item;
    });
    search.segments.forEach((segment, index) => {
      if (index === 0 || !segment.date || !search.segments[index - 1].date) return;
      if (segment.date < search.segments[index - 1].date) {
        segmentErrors[index].date = "This date must be on or after the previous city.";
      }
    });
    if (segmentErrors.some((item) => Object.keys(item).length > 0)) {
      errors.segments = segmentErrors;
    }
    if (search.segments.length < 2) errors.segmentsCount = "Add at least two cities.";
    return errors;
  }

  const fromError = airportError(search.from, "departure");
  const toError = airportError(search.to, "arrival");
  if (fromError) errors.from = fromError;
  if (toError) errors.to = toError;
  if (search.from && search.from === search.to) errors.to = "From and To must be different.";
  if (!search.departureDate) errors.departureDate = "Choose a departure date.";
  if (search.tripType === "roundtrip") {
    if (!search.returnDate) errors.returnDate = "Choose a return date.";
    else if (search.departureDate && search.returnDate < search.departureDate) {
      errors.returnDate = "Return date must be on or after departure.";
    }
  }
  return errors;
}
