import { COUNTRIES } from "../data/airports";
import { ageOnDate } from "../utils/time";

export const TITLES = ["Mr", "Mrs", "Ms", "Miss", "Mstr"];
export const GENDERS = ["Female", "Male", "Other"];

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]{1,39}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSPORT_PATTERN = /^[A-Za-z0-9]{6,12}$/;

export function emptyPassenger(type) {
  return {
    type,
    title: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "IN",
    email: "",
    mobile: "",
    passportNumber: "",
    passportExpiry: "",
    passportCountry: "",
  };
}

export function passengerSlots(search) {
  const slots = [];
  for (let i = 0; i < Number(search.adults); i += 1) slots.push("adult");
  for (let i = 0; i < Number(search.children); i += 1) slots.push("child");
  for (let i = 0; i < Number(search.infants); i += 1) slots.push("infant");
  return slots;
}

export function blankPassengers(search) {
  return passengerSlots(search).map((type) => emptyPassenger(type));
}

function ageError(type, age) {
  if (age === null) return "Enter a valid date of birth.";
  if (age < 0) return "Date of birth cannot be in the future.";
  if (type === "adult" && age < 12) return "Adults must be 12 or older on departure.";
  if (type === "child" && (age < 2 || age > 11)) return "Children must be 2–11 years old on departure.";
  if (type === "infant" && age >= 2) return "Infants must be under 2 years old on departure.";
  return "";
}

export function validatePassengers(passengers, { international, travelDate }) {
  const errors = {};
  passengers.forEach((passenger, index) => {
    const item = {};
    if (!TITLES.includes(passenger.title)) item.title = "Choose a title.";
    if (!NAME_PATTERN.test(passenger.firstName.trim())) item.firstName = "Enter a first name.";
    if (!NAME_PATTERN.test(passenger.lastName.trim())) item.lastName = "Enter a last name.";
    const dobError = ageError(passenger.type, ageOnDate(passenger.dateOfBirth, travelDate));
    if (dobError) item.dateOfBirth = dobError;
    if (!GENDERS.includes(passenger.gender)) item.gender = "Choose a gender.";
    if (!COUNTRIES.some((country) => country.code === passenger.nationality)) {
      item.nationality = "Choose a nationality.";
    }
    if (!EMAIL_PATTERN.test(passenger.email.trim())) item.email = "Enter a valid email.";
    const mobile = passenger.mobile.replace(/\s/g, "");
    if (!/^\+?[0-9]{8,15}$/.test(mobile)) item.mobile = "Enter a valid mobile number.";

    if (international) {
      if (!PASSPORT_PATTERN.test(passenger.passportNumber.trim())) {
        item.passportNumber = "Enter a passport number (6–12 letters or digits).";
      }
      if (!passenger.passportExpiry) item.passportExpiry = "Enter the passport expiry.";
      else if (travelDate && passenger.passportExpiry <= travelDate) {
        item.passportExpiry = "Passport must be valid after the departure date.";
      }
      if (!COUNTRIES.some((country) => country.code === passenger.passportCountry)) {
        item.passportCountry = "Choose the passport country.";
      }
    }

    if (Object.keys(item).length > 0) errors[index] = item;
  });
  return errors;
}

export function passengerTypeLabel(type, index, passengers) {
  const same = passengers.filter((item) => item.type === type);
  const position = same.indexOf(passengers[index]) + 1;
  const name = type === "adult" ? "Adult" : type === "child" ? "Child" : "Infant";
  return same.length > 1 ? `${name} ${position}` : name;
}
