import { hotelCities } from "../data/hotels";
import { nightCount } from "../utils/dates";

export function validateHotelSearch(search) {
  const errors = {};
  if (!hotelCities().includes(search.destination)) errors.destination = "Choose a destination.";
  if (!search.checkIn) errors.checkIn = "Choose a check-in date.";
  if (!search.checkOut) errors.checkOut = "Choose a check-out date.";
  else if (search.checkIn && nightCount(search.checkIn, search.checkOut) < 1) {
    errors.checkOut = "Check-out must be after check-in.";
  }

  const rooms = Number(search.rooms);
  const adults = Number(search.adults);
  const children = Number(search.children);
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 5) errors.rooms = "Choose 1 to 5 rooms.";
  if (!Number.isInteger(adults) || adults < 1 || adults > 8) errors.adults = "Add 1 to 8 adults.";
  if (!Number.isInteger(children) || children < 0 || children > 6) {
    errors.children = "Children must be between 0 and 6.";
  }
  return errors;
}
