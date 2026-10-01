/** Sample city pairs used to build demo itineraries. Not a live schedule. */
export const SAMPLE_ROUTES = [
  { from: "DEL", to: "BOM", minutes: 130, base: 4200 },
  { from: "DEL", to: "BLR", minutes: 165, base: 5100 },
  { from: "DEL", to: "GOI", minutes: 160, base: 4800 },
  { from: "DEL", to: "JAI", minutes: 75, base: 2800 },
  { from: "DEL", to: "UDR", minutes: 95, base: 3400 },
  { from: "DEL", to: "HYD", minutes: 125, base: 4000 },
  { from: "DEL", to: "MAA", minutes: 165, base: 5300 },
  { from: "DEL", to: "CCU", minutes: 145, base: 4600 },
  { from: "DEL", to: "AMD", minutes: 85, base: 2600 },
  { from: "BOM", to: "BLR", minutes: 105, base: 3200 },
  { from: "BOM", to: "GOI", minutes: 80, base: 2700 },
  { from: "BOM", to: "HYD", minutes: 90, base: 3100 },
  { from: "BOM", to: "AMD", minutes: 75, base: 2400 },
  { from: "BLR", to: "GOI", minutes: 70, base: 2500 },
  { from: "BLR", to: "MAA", minutes: 65, base: 2300 },
  { from: "BLR", to: "HYD", minutes: 60, base: 2100 },
  { from: "DEL", to: "DXB", minutes: 220, base: 14500 },
  { from: "BOM", to: "DXB", minutes: 195, base: 13200 },
  { from: "DEL", to: "SIN", minutes: 340, base: 16800 },
  { from: "DEL", to: "BKK", minutes: 255, base: 15200 },
  { from: "DEL", to: "LHR", minutes: 540, base: 38500 },
  { from: "BOM", to: "LHR", minutes: 570, base: 40200 },
];

export const HUBS = ["HYD", "AMD", "MAA", "CCU"];

export const SCHEDULE_PATTERNS = [
  { airline: "SL", depart: "06:25", stops: 0, refundable: false, number: 210 },
  { airline: "IW", depart: "09:50", stops: 1, refundable: true, number: 118 },
  { airline: "CJ", depart: "14:15", stops: 0, refundable: false, number: 540 },
  { airline: "HA", depart: "19:05", stops: 1, refundable: true, number: 804 },
  { airline: "SL", depart: "01:10", stops: 2, refundable: false, number: 902 },
];

export function findSampleRoute(from, to) {
  return (
    SAMPLE_ROUTES.find(
      (route) =>
        (route.from === from && route.to === to) ||
        (route.from === to && route.to === from)
    ) || null
  );
}
