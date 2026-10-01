import { ROOM_PREFERENCES } from "../data/options";
import { nightCount } from "../utils/dates";

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]{1,59}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateHolidayBooking(form) {
  const errors = {};
  if (!NAME_PATTERN.test(String(form.name || "").trim())) errors.name = "Enter the customer name.";
  if (!EMAIL_PATTERN.test(String(form.email || "").trim())) errors.email = "Enter a valid email.";
  const mobile = String(form.mobile || "").replace(/\s/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(mobile)) errors.mobile = "Enter a valid mobile number.";
  if (!form.startDate) errors.startDate = "Choose a travel start date.";
  if (!form.endDate) errors.endDate = "Choose a travel end date.";
  else if (form.startDate && nightCount(form.startDate, form.endDate) < 1) {
    errors.endDate = "The end date must be after the start date.";
  }
  const adults = Number(form.adults);
  const children = Number(form.children);
  if (!Number.isInteger(adults) || adults < 1 || adults > 9) errors.adults = "Add 1 to 9 adults.";
  if (!Number.isInteger(children) || children < 0 || children > 6) errors.children = "Children must be between 0 and 6.";
  if (!ROOM_PREFERENCES.includes(form.room)) errors.room = "Choose a room preference.";
  if (String(form.requirements || "").length > 300) {
    errors.requirements = "Keep special requirements under 300 characters.";
  }
  return errors;
}

export function validateHolidayEnquiry(form) {
  const errors = {};
  if (!NAME_PATTERN.test(String(form.name || "").trim())) errors.name = "Enter your name.";
  if (!EMAIL_PATTERN.test(String(form.email || "").trim())) errors.email = "Enter a valid email.";
  const mobile = String(form.mobile || "").replace(/\s/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(mobile)) errors.mobile = "Enter a valid mobile number.";
  if (String(form.message || "").trim().length < 10) errors.message = "Write a short message.";
  return errors;
}
