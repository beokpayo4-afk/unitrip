export const SCOPES = [
  { value: "domestic", label: "Domestic" },
  { value: "international", label: "International" },
];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "THB"];

export const HOTEL_OPTIONS = [
  { value: "3-star", label: "3 Star" },
  { value: "4-star", label: "4 Star" },
  { value: "5-star", label: "5 Star" },
  { value: "luxury", label: "Luxury" },
];

export const TRIP_TYPES = ["Honeymoon", "Family", "Adventure", "Solo", "Friends", "Corporate", "Religious", "Leisure"];

export const INTERESTS = ["Sightseeing", "Beaches", "Mountains", "Shopping", "Adventure", "Wildlife", "Nightlife", "Food", "Culture"];

export const TRANSPORT_OPTIONS = ["Flight", "Train", "Bus", "Private Cab", "Airport Transfer"];

export const PLANNER_STEPS = [
  { id: 1, title: "Destination" },
  { id: 2, title: "Travel dates" },
  { id: 3, title: "Travellers" },
  { id: 4, title: "Budget" },
  { id: 5, title: "Hotel preference" },
  { id: 6, title: "Trip type" },
  { id: 7, title: "Interests" },
  { id: 8, title: "Transport" },
  { id: 9, title: "Special requirements" },
  { id: 10, title: "Customer information" },
  { id: 11, title: "Review" },
];

export const EMPTY_TRIP_REQUEST = {
  step: 1,
  destination: "",
  scope: "",
  departureDate: "",
  returnDate: "",
  flexible: false,
  adults: "2",
  children: "0",
  infants: "0",
  budgetMin: "",
  budgetMax: "",
  currency: "INR",
  hotel: "",
  tripTypes: [],
  interests: [],
  transport: [],
  requirements: "",
  name: "",
  email: "",
  phone: "",
  whatsapp: "",
};
