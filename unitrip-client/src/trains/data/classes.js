export const TRAVEL_CLASSES = [
  { value: "all", label: "All Classes" },
  { value: "1A", label: "1A" },
  { value: "2A", label: "2A" },
  { value: "3A", label: "3A" },
  { value: "SL", label: "SL" },
  { value: "CC", label: "CC" },
  { value: "EC", label: "EC" },
  { value: "2S", label: "2S" },
];

export const QUOTAS = [
  { value: "general", label: "General" },
  { value: "ladies", label: "Ladies" },
  { value: "senior", label: "Senior Citizen" },
  { value: "tatkal", label: "Tatkal" },
];

export const CLASS_ORDER = ["1A", "2A", "3A", "SL", "CC", "EC", "2S"];

export function classLabel(code) {
  return TRAVEL_CLASSES.find((item) => item.value === code)?.label || code;
}

export function quotaLabel(value) {
  return QUOTAS.find((item) => item.value === value)?.label || value;
}

export function adjustedFare(fare, quota) {
  if (quota === "tatkal") return Math.round(fare * 1.12);
  if (quota === "senior") return Math.round(fare * 0.6);
  return fare;
}
