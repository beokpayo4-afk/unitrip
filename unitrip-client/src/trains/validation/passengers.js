const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]{1,59}$/;

export const GENDERS = ["Male", "Female", "Transgender"];
export const ID_TYPES = ["Aadhaar", "PAN", "Passport", "Driving Licence", "Voter ID"];

export function berthOptions(classCode) {
  if (classCode === "SL" || classCode === "3A") {
    return ["Lower", "Middle", "Upper", "Side Lower", "Side Upper", "No preference"];
  }
  if (classCode === "2A" || classCode === "1A") {
    return ["Lower", "Upper", "Side Lower", "Side Upper", "No preference"];
  }
  return ["Window", "Aisle", "No preference"];
}

export function emptyPassenger() {
  return { name: "", age: "", gender: "", berth: "", idType: "", idNumber: "" };
}

function idError(type, number) {
  const value = String(number || "").trim();
  if (!ID_TYPES.includes(type)) return "Choose an ID type.";
  if (type === "Aadhaar" && !/^[0-9]{12}$/.test(value)) return "Enter a 12-digit Aadhaar number.";
  if (type === "PAN" && !/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/.test(value)) return "Enter a valid PAN.";
  if (!/^[A-Za-z0-9]{5,20}$/.test(value)) return "Enter the ID number.";
  return "";
}

export function validatePassengers(passengers, { classCode, quota }) {
  const errors = {};
  if (!passengers.length) return { form: "Add at least one passenger." };
  passengers.forEach((passenger, index) => {
    const item = {};
    if (!NAME_PATTERN.test(passenger.name.trim())) item.name = "Enter the passenger name.";
    const age = Number(passenger.age);
    if (!Number.isInteger(age) || age < 1 || age > 125) item.age = "Enter an age from 1 to 125.";
    if (!GENDERS.includes(passenger.gender)) item.gender = "Choose a gender.";
    if (!berthOptions(classCode).includes(passenger.berth)) item.berth = "Choose a berth preference.";
    const identity = idError(passenger.idType, passenger.idNumber);
    if (identity && !ID_TYPES.includes(passenger.idType)) item.idType = identity;
    else if (identity) item.idNumber = identity;
    if (Object.keys(item).length > 0) errors[index] = item;
  });
  if (quota === "ladies" && !passengers.some((passenger) => passenger.gender === "Female")) {
    errors.form = "Ladies quota needs at least one female passenger in this sample.";
  }
  if (quota === "senior" && !passengers.some((passenger) => Number(passenger.age) >= 60)) {
    errors.form = "Senior citizen quota needs at least one passenger aged 60 or older in this sample.";
  }
  return errors;
}

export function maskId(value) {
  const raw = String(value || "");
  if (raw.length <= 4) return raw;
  return `${"•".repeat(Math.min(raw.length - 4, 8))}${raw.slice(-4)}`;
}
