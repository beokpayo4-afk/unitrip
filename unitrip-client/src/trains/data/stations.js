export const STATIONS = [
  { code: "NDLS", name: "New Delhi" },
  { code: "MMCT", name: "Mumbai Central" },
  { code: "JP", name: "Jaipur Jn" },
  { code: "UDZ", name: "Udaipur City" },
  { code: "HWH", name: "Howrah Jn" },
  { code: "SBC", name: "KSR Bengaluru" },
  { code: "MAS", name: "MGR Chennai Central" },
  { code: "ADI", name: "Ahmedabad Jn" },
  { code: "AGC", name: "Agra Cantt" },
  { code: "BPL", name: "Bhopal Jn" },
  { code: "CNB", name: "Kanpur Central" },
  { code: "KOTA", name: "Kota Jn" },
  { code: "BRC", name: "Vadodara Jn" },
];

export function stationByCode(code) {
  return STATIONS.find((station) => station.code === code) || { code, name: code };
}
