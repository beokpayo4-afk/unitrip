export const AIRPORTS = [
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International", country: "IN" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj", country: "IN" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International", country: "IN" },
  { code: "GOI", city: "Goa", name: "Manohar International", country: "IN" },
  { code: "JAI", city: "Jaipur", name: "Jaipur International", country: "IN" },
  { code: "UDR", city: "Udaipur", name: "Maharana Pratap", country: "IN" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International", country: "IN" },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel", country: "IN" },
  { code: "MAA", city: "Chennai", name: "Chennai International", country: "IN" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose", country: "IN" },
  { code: "DXB", city: "Dubai", name: "Dubai International", country: "AE" },
  { code: "SIN", city: "Singapore", name: "Changi", country: "SG" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "TH" },
  { code: "LHR", city: "London", name: "Heathrow", country: "GB" },
];

export const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "NP", name: "Nepal" },
  { code: "LK", name: "Sri Lanka" },
];

export function airportByCode(code) {
  return AIRPORTS.find((airport) => airport.code === code) || null;
}

export function isInternationalRoute(codes) {
  return codes.some((code) => {
    const airport = airportByCode(code);
    return airport && airport.country !== "IN";
  });
}
