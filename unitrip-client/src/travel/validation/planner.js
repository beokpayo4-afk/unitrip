import { CURRENCIES, HOTEL_OPTIONS, INTERESTS, SCOPES, TRANSPORT_OPTIONS, TRIP_TYPES } from "../data/options";

function todayISO() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function integerIn(value, min, max) {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max;
}

export function validateTripStep(step, draft) {
  const errors = {};
  if (step === 1) {
    if (!/^[A-Za-z0-9][A-Za-z0-9\s,'-]{1,79}$/.test(String(draft.destination || "").trim())) {
      errors.destination = "Enter a destination.";
    }
    if (!SCOPES.some((item) => item.value === draft.scope)) {
      errors.scope = "Choose domestic or international.";
    }
  }
  if (step === 2) {
    if (!draft.departureDate) errors.departureDate = "Choose a departure date.";
    else if (draft.departureDate < todayISO()) errors.departureDate = "Departure cannot be in the past.";
    if (!draft.returnDate) errors.returnDate = "Choose a return date.";
    else if (draft.departureDate && draft.returnDate <= draft.departureDate) {
      errors.returnDate = "Return must be after departure.";
    }
  }
  if (step === 3) {
    if (!integerIn(draft.adults, 1, 12)) errors.adults = "Add 1 to 12 adults.";
    if (!integerIn(draft.children, 0, 8)) errors.children = "Children must be between 0 and 8.";
    if (!integerIn(draft.infants, 0, 6)) errors.infants = "Infants must be between 0 and 6.";
    else if (Number(draft.infants) > Number(draft.adults)) errors.infants = "Each infant needs an adult.";
  }
  if (step === 4) {
    const min = Number(draft.budgetMin);
    const max = Number(draft.budgetMax);
    if (!Number.isFinite(min) || min < 1) errors.budgetMin = "Enter a minimum budget.";
    if (!Number.isFinite(max) || max < 1) errors.budgetMax = "Enter a maximum budget.";
    else if (Number.isFinite(min) && max < min) errors.budgetMax = "Maximum budget must be at least the minimum.";
    if (!CURRENCIES.includes(draft.currency)) errors.currency = "Choose a currency.";
  }
  if (step === 5 && !HOTEL_OPTIONS.some((item) => item.value === draft.hotel)) {
    errors.hotel = "Choose a hotel preference.";
  }
  if (step === 6 && !draft.tripTypes?.length) errors.tripTypes = "Choose at least one trip type.";
  if (step === 6 && draft.tripTypes?.some((item) => !TRIP_TYPES.includes(item))) {
    errors.tripTypes = "Choose a listed trip type.";
  }
  if (step === 7 && !draft.interests?.length) errors.interests = "Choose at least one interest.";
  if (step === 7 && draft.interests?.some((item) => !INTERESTS.includes(item))) {
    errors.interests = "Choose a listed interest.";
  }
  if (step === 8 && !draft.transport?.length) errors.transport = "Choose at least one transport option.";
  if (step === 8 && draft.transport?.some((item) => !TRANSPORT_OPTIONS.includes(item))) {
    errors.transport = "Choose a listed transport option.";
  }
  if (step === 9 && String(draft.requirements || "").trim().length > 2000) {
    errors.requirements = "Keep special requirements under 2000 characters.";
  }
  if (step === 10) {
    if (!/^[A-Za-z][A-Za-z\s'-]{1,79}$/.test(String(draft.name || "").trim())) errors.name = "Enter the full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(draft.email || "").trim())) errors.email = "Enter a valid email.";
    if (!/^\+?[0-9]{8,15}$/.test(String(draft.phone || "").replace(/\s/g, ""))) errors.phone = "Enter a valid phone number.";
    if (!/^\+?[0-9]{8,15}$/.test(String(draft.whatsapp || "").replace(/\s/g, ""))) {
      errors.whatsapp = "Enter a valid WhatsApp number.";
    }
  }
  return errors;
}

export function validateTripRequest(draft) {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].reduce(
    (errors, step) => ({ ...errors, ...validateTripStep(step, draft) }),
    {}
  );
}

export function tripEnquiryPayload(draft) {
  return {
    destination: draft.destination.trim(),
    scope: draft.scope,
    departureDate: draft.departureDate,
    returnDate: draft.returnDate,
    flexible: Boolean(draft.flexible),
    adults: Number(draft.adults),
    children: Number(draft.children),
    infants: Number(draft.infants),
    budgetMin: Number(draft.budgetMin),
    budgetMax: Number(draft.budgetMax),
    currency: draft.currency,
    hotel: draft.hotel,
    tripTypes: draft.tripTypes,
    interests: draft.interests,
    transport: draft.transport,
    requirements: String(draft.requirements || "").trim(),
    name: draft.name.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    whatsapp: draft.whatsapp.trim(),
  };
}
