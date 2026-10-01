export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price low to high" },
  { value: "price-desc", label: "Price high to low" },
  { value: "rating", label: "Rating" },
];

export const EMPTY_FILTERS = {
  priceMin: "",
  priceMax: "",
  stars: [],
  minGuestRating: "any",
  areas: [],
  amenities: [],
  freeCancellation: false,
  breakfast: false,
};

function roomMatches(room, filters) {
  if (filters.freeCancellation && !room.freeCancellation) return false;
  if (filters.breakfast && !String(room.meals).toLowerCase().includes("breakfast")) return false;
  return true;
}

export function displayRoom(hotel, filters) {
  const matches = hotel.rooms.filter((room) => roomMatches(room, filters));
  if (matches.length === 0) return null;
  return [...matches].sort((a, b) => a.price.total - b.price.total)[0];
}

export function filterAndSortHotels(hotels, filters, sort) {
  const list = hotels.filter((hotel) => {
    const room = displayRoom(hotel, filters);
    if (!room) return false;
    const price = room.price.total;
    if (filters.priceMin !== "" && price < Number(filters.priceMin)) return false;
    if (filters.priceMax !== "" && price > Number(filters.priceMax)) return false;
    if (filters.stars.length > 0 && !filters.stars.includes(hotel.stars)) return false;
    if (filters.minGuestRating !== "any" && hotel.guestRating < Number(filters.minGuestRating)) {
      return false;
    }
    if (filters.areas.length > 0 && !filters.areas.includes(hotel.area)) return false;
    if (filters.amenities.some((amenity) => !hotel.amenities.includes(amenity))) return false;
    return true;
  });

  const sorted = [...list];
  if (sort === "price-asc") {
    sorted.sort((a, b) => displayRoom(a, filters).price.total - displayRoom(b, filters).price.total);
  } else if (sort === "price-desc") {
    sorted.sort((a, b) => displayRoom(b, filters).price.total - displayRoom(a, filters).price.total);
  } else if (sort === "rating") {
    sorted.sort((a, b) => b.guestRating - a.guestRating);
  } else {
    sorted.sort((a, b) => b.recommended - a.recommended);
  }
  return sorted;
}
