export const AIRLINES = {
  SL: { code: "SL", name: "Skyline Air" },
  IW: { code: "IW", name: "Indus Wings" },
  CJ: { code: "CJ", name: "Coastal Jet" },
  HA: { code: "HA", name: "Himalaya Air" },
};

export function airlineByCode(code) {
  return AIRLINES[code] || { code, name: code };
}
