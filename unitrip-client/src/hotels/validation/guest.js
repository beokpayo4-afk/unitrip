const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]{1,59}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyGuest(search) {
  return {
    name: "",
    email: "",
    mobile: "",
    guests: Number(search.adults) + Number(search.children),
    requests: "",
  };
}

export function validateGuest(guest) {
  const errors = {};
  if (!NAME_PATTERN.test(String(guest.name || "").trim())) errors.name = "Enter the guest name.";
  if (!EMAIL_PATTERN.test(String(guest.email || "").trim())) errors.email = "Enter a valid email.";
  const mobile = String(guest.mobile || "").replace(/\s/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(mobile)) errors.mobile = "Enter a valid mobile number.";
  const guests = Number(guest.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 12) {
    errors.guests = "Enter 1 to 12 guests.";
  }
  if (String(guest.requests || "").length > 300) {
    errors.requests = "Keep special requests under 300 characters.";
  }
  return errors;
}
