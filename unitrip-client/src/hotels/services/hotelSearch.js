import { SAMPLE_HOTELS } from "../data/hotels";
import { nightCount } from "../utils/dates";
import { quoteStay } from "./pricing";

export const HOTEL_DATA_SOURCE = "mock";

export const SAMPLE_DISCLAIMER =
  "These are sample stays for the UNITRIP demo. They are not live hotel availability, and selecting a room does not hold a real reservation.";

function fitsParty(room, criteria) {
  const rooms = Math.max(1, Number(criteria.rooms));
  const adultsPerRoom = Math.ceil(Number(criteria.adults) / rooms);
  const childrenPerRoom = Math.ceil(Number(criteria.children) / rooms);
  return adultsPerRoom <= room.maxAdults && childrenPerRoom <= room.maxChildren;
}

function priceRoom(room, criteria, nights) {
  return {
    ...room,
    price: quoteStay(room.pricePerNight, nights, criteria.rooms),
  };
}

export function searchHotels(criteria) {
  const nights = nightCount(criteria.checkIn, criteria.checkOut);
  const hotels = SAMPLE_HOTELS.filter((hotel) => hotel.city === criteria.destination)
    .map((hotel) => {
      const rooms = hotel.rooms
        .filter((item) => fitsParty(item, criteria))
        .map((item) => priceRoom(item, criteria, nights));
      return { ...hotel, rooms };
    })
    .filter((hotel) => hotel.rooms.length > 0);

  return { source: HOTEL_DATA_SOURCE, disclaimer: SAMPLE_DISCLAIMER, nights, hotels };
}

export function selectedStay(draft) {
  const hotel = draft.result?.hotels?.find((item) => item.id === draft.selectedHotelId) || null;
  const room = hotel?.rooms.find((item) => item.id === draft.selectedRoomId) || null;
  return { hotel, room };
}

