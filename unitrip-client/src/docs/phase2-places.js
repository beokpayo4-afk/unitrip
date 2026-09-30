/**
 * Phase 2 places (implemented):
 * - Admin: package form → Places (included | paid_addon + distanceKm + extraAmount)
 * - Booking: select paid add-ons via placeIds; included places snapshotted on ticket
 * - After booking: AddOnsEditor on package success, Track order, My bookings
 * - Total = package.amount × travellers + sum(addOn.extraAmount)
 */
export const PHASE2_PLACES_SHAPE = {
  name: "",
  description: "",
  distanceKm: 0,
  extraAmount: 0,
  type: "included", // or 'paid_addon'
};
