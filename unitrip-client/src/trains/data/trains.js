const DAILY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EXCEPT_SUNDAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Sample timetable. Not a live Indian Railways enquiry. */
export const SAMPLE_TRAINS = [
  {
    id: "12951",
    number: "12951",
    name: "Rajdhani Express",
    type: "Rajdhani",
    runningDays: DAILY,
    route: [
      { code: "NDLS", arrival: null, departure: "16:55", day: 1, halt: null, km: 0 },
      { code: "KOTA", arrival: "21:18", departure: "21:23", day: 1, halt: 5, km: 465 },
      { code: "BRC", arrival: "03:40", departure: "03:50", day: 2, halt: 10, km: 990 },
      { code: "MMCT", arrival: "08:35", departure: null, day: 2, halt: null, km: 1384 },
    ],
    classes: {
      "1A": { fare: 4850, availability: "Available 6" },
      "2A": { fare: 2850, availability: "Available 28" },
      "3A": { fare: 2050, availability: "WL 4" },
    },
  },
  {
    id: "12952",
    number: "12952",
    name: "Rajdhani Express",
    type: "Rajdhani",
    runningDays: DAILY,
    route: [
      { code: "MMCT", arrival: null, departure: "17:05", day: 1, halt: null, km: 0 },
      { code: "BRC", arrival: "21:40", departure: "21:50", day: 1, halt: 10, km: 392 },
      { code: "KOTA", arrival: "04:10", departure: "04:15", day: 2, halt: 5, km: 920 },
      { code: "NDLS", arrival: "08:32", departure: null, day: 2, halt: null, km: 1384 },
    ],
    classes: {
      "1A": { fare: 4850, availability: "Available 4" },
      "2A": { fare: 2850, availability: "RAC 6" },
      "3A": { fare: 2050, availability: "Available 18" },
    },
  },
  {
    id: "12302",
    number: "12302",
    name: "Howrah Rajdhani",
    type: "Rajdhani",
    runningDays: DAILY,
    route: [
      { code: "NDLS", arrival: null, departure: "16:55", day: 1, halt: null, km: 0 },
      { code: "CNB", arrival: "21:43", departure: "21:48", day: 1, halt: 5, km: 440 },
      { code: "HWH", arrival: "09:55", departure: null, day: 2, halt: null, km: 1447 },
    ],
    classes: {
      "1A": { fare: 5120, availability: "Available 3" },
      "2A": { fare: 3080, availability: "Available 16" },
      "3A": { fare: 2180, availability: "WL 9" },
    },
  },
  {
    id: "12002",
    number: "12002",
    name: "Shatabdi Express",
    type: "Shatabdi",
    runningDays: EXCEPT_SUNDAY,
    route: [
      { code: "NDLS", arrival: null, departure: "06:15", day: 1, halt: null, km: 0 },
      { code: "AGC", arrival: "08:11", departure: "08:13", day: 1, halt: 2, km: 195 },
      { code: "BPL", arrival: "14:05", departure: null, day: 1, halt: null, km: 701 },
    ],
    classes: {
      CC: { fare: 1420, availability: "Available 64" },
      EC: { fare: 2680, availability: "Available 12" },
    },
  },
  {
    id: "12916",
    number: "12916",
    name: "Ashram Express",
    type: "Superfast",
    runningDays: EXCEPT_SUNDAY,
    route: [
      { code: "NDLS", arrival: null, departure: "15:20", day: 1, halt: null, km: 0 },
      { code: "JP", arrival: "20:40", departure: "20:50", day: 1, halt: 10, km: 308 },
      { code: "ADI", arrival: "08:15", departure: null, day: 2, halt: null, km: 936 },
    ],
    classes: {
      "2A": { fare: 1860, availability: "Available 10" },
      "3A": { fare: 1320, availability: "Available 22" },
      SL: { fare: 520, availability: "WL 14" },
      "2S": { fare: 240, availability: "Available 40" },
    },
  },
  {
    id: "12996",
    number: "12996",
    name: "Udaipur City Express",
    type: "Express",
    runningDays: DAILY,
    route: [
      { code: "JP", arrival: null, departure: "22:40", day: 1, halt: null, km: 0 },
      { code: "UDZ", arrival: "06:25", departure: null, day: 2, halt: null, km: 431 },
    ],
    classes: {
      "2A": { fare: 980, availability: "Available 8" },
      "3A": { fare: 690, availability: "Available 14" },
      SL: { fare: 280, availability: "Available 36" },
    },
  },
  {
    id: "12627",
    number: "12627",
    name: "Karnataka Express",
    type: "Express",
    runningDays: DAILY,
    route: [
      { code: "NDLS", arrival: null, departure: "20:20", day: 1, halt: null, km: 0 },
      { code: "JP", arrival: "01:55", departure: "02:05", day: 2, halt: 10, km: 308 },
      { code: "SBC", arrival: "05:40", departure: null, day: 3, halt: null, km: 2444 },
    ],
    classes: {
      "1A": { fare: 6420, availability: "WL 2" },
      "2A": { fare: 3740, availability: "Available 6" },
      "3A": { fare: 2620, availability: "RAC 3" },
      SL: { fare: 980, availability: "WL 21" },
    },
  },
  {
    id: "12007",
    number: "12007",
    name: "Shatabdi Express",
    type: "Shatabdi",
    runningDays: EXCEPT_SUNDAY,
    route: [
      { code: "MAS", arrival: null, departure: "06:00", day: 1, halt: null, km: 0 },
      { code: "SBC", arrival: "11:00", departure: null, day: 1, halt: null, km: 362 },
    ],
    classes: {
      CC: { fare: 1180, availability: "Available 48" },
      EC: { fare: 2240, availability: "Available 9" },
    },
  },
];

export const SAMPLE_RULES = [
  "Carry the ID entered for each passenger. This demo does not check it with the railways.",
  "Berth preference is stored only. No berth or seat is allotted.",
  "Fares, availability, and running days are sample figures, not an IRCTC enquiry.",
  "No PNR is issued and no ticket is created with Indian Railways.",
];
