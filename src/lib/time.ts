const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/** "3 hours ago", "in 2 days"… */
export function relativeTime(date: Date, now = Date.now()) {
  const seconds = Math.round((date.getTime() - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === "second") {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }
  return "";
}

/** Parses "YYYY-MM-DD" as a local calendar date (not UTC midnight). */
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const utcDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole calendar days from a to b, immune to daylight saving shifts. */
export const daysBetween = (a: Date, b: Date) => Math.round((utcDay(b) - utcDay(a)) / 86400000);

/** Adds months, clamping the day so Jan 31 + 1 month is the last day of February. */
export function addMonths(date: Date, months: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
}

/** Calendar difference in years, months and days (a must not be after b). */
export function calendarDiff(a: Date, b: Date) {
  let months = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
  if (b.getDate() < a.getDate()) months--;
  // Count whole months first, then the days left over.
  const days = daysBetween(addMonths(a, months), b);
  return { years: Math.floor(months / 12), months: months % 12, days };
}

/** Monday–Friday days from a (inclusive) to b (exclusive). */
export function weekdaysBetween(a: Date, b: Date) {
  const total = daysBetween(a, b);
  let count = Math.floor(total / 7) * 5;
  const start = a.getDay();
  for (let i = 0; i < total % 7; i++) {
    const day = (start + i) % 7;
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

export const formatDateTime = (date: Date, timeZone?: string) =>
  date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long", timeZone });

export const pad = (n: number, width = 2) => String(n).padStart(width, "0");

/** 3723.4 → "1:02:03.40" */
export function formatClock(ms: number, showHundredths = true) {
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const hs = Math.floor((total % 1000) / 10);
  const main = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return showHundredths ? `${main}.${pad(hs)}` : main;
}
