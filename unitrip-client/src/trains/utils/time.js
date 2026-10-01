export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function localISODate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function weekdayOf(isoDate) {
  return WEEKDAYS[new Date(`${isoDate}T00:00:00`).getDay()];
}

export function minutesBetween(departTime, departDay, arriveTime, arriveDay) {
  const [departHour, departMinute] = departTime.split(":").map(Number);
  const [arriveHour, arriveMinute] = arriveTime.split(":").map(Number);
  return (arriveDay - departDay) * 1440 + (arriveHour * 60 + arriveMinute) - (departHour * 60 + departMinute);
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function timeBucket(time) {
  const hour = Number(String(time).slice(0, 2));
  if (hour < 6) return "early";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export const TIME_BUCKETS = [
  { id: "early", label: "Early morning (12am–6am)" },
  { id: "morning", label: "Morning (6am–12pm)" },
  { id: "afternoon", label: "Afternoon (12pm–6pm)" },
  { id: "evening", label: "Evening (6pm–12am)" },
];
