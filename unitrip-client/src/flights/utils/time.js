export function localISODate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addMinutes(time, minutes) {
  const [hour, minute] = time.split(":").map(Number);
  let total = hour * 60 + minute + minutes;
  let dayOffset = 0;
  while (total >= 24 * 60) {
    total -= 24 * 60;
    dayOffset += 1;
  }
  while (total < 0) {
    total += 24 * 60;
    dayOffset -= 1;
  }
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return { time: `${hh}:${mm}`, dayOffset };
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

export function stopsLabel(stops) {
  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

export function ageOnDate(dob, onDate) {
  if (!dob || !onDate) return null;
  const birth = new Date(`${dob}T00:00:00`);
  const on = new Date(`${onDate}T00:00:00`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(on.getTime())) return null;
  let age = on.getFullYear() - birth.getFullYear();
  const month = on.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && on.getDate() < birth.getDate())) age -= 1;
  return age;
}
