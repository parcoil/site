// Standard 5-field cron: minute hour day-of-month month day-of-week.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

type FieldSpec = { name: string; min: number; max: number; names?: string[] };

const FIELDS: FieldSpec[] = [
  { name: "minute", min: 0, max: 59 },
  { name: "hour", min: 0, max: 23 },
  { name: "day of month", min: 1, max: 31 },
  { name: "month", min: 1, max: 12, names: MONTHS },
  { name: "day of week", min: 0, max: 7, names: DAYS },
];

export type CronSchedule = {
  fields: string[];
  values: number[][]; // allowed values per field, sorted
  restrictedDom: boolean;
  restrictedDow: boolean;
};

function parseValue(token: string, spec: FieldSpec) {
  const byName = spec.names?.findIndex((n) => n.slice(0, 3).toLowerCase() === token.toLowerCase());
  if (byName !== undefined && byName >= 0) return spec.name === "month" ? byName + 1 : byName;
  if (!/^\d+$/.test(token)) throw new Error(`"${token}" isn't a valid ${spec.name}.`);
  const value = Number(token);
  if (value < spec.min || value > spec.max) {
    throw new Error(`${spec.name} must be between ${spec.min} and ${spec.max}, got ${value}.`);
  }
  return value;
}

function expandField(field: string, spec: FieldSpec) {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    const [range, stepText] = part.split("/");
    const step = stepText === undefined ? 1 : Number(stepText);
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step "${stepText}" in ${spec.name}.`);
    let start: number;
    let end: number;
    if (range === "*") {
      [start, end] = [spec.min, spec.name === "day of week" ? 6 : spec.max];
    } else if (range.includes("-")) {
      const [a, b] = range.split("-");
      [start, end] = [parseValue(a, spec), parseValue(b, spec)];
      if (start > end) throw new Error(`Range ${range} in ${spec.name} goes backwards.`);
    } else {
      start = parseValue(range, spec);
      end = stepText === undefined ? start : spec.max;
    }
    for (let v = start; v <= end; v += step) values.add(spec.name === "day of week" ? v % 7 : v);
  }
  return [...values].sort((a, b) => a - b);
}

export function parseCron(expression: string): CronSchedule {
  const text = MACROS[expression.trim().toLowerCase()] ?? expression.trim();
  const fields = text.split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`Expected 5 fields (minute hour day month weekday), found ${fields.length}.`);
  }
  return {
    fields,
    values: fields.map((f, i) => expandField(f, FIELDS[i])),
    restrictedDom: fields[2] !== "*",
    restrictedDow: fields[4] !== "*",
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

/** Describes one field's raw text, e.g. "MON-FRI" → "Monday through Friday". */
function describeParts(field: string, spec: FieldSpec, label: (v: number) => string) {
  return list(
    field.split(",").map((part) => {
      const [range, step] = part.split("/");
      let base = "";
      if (range !== "*") {
        const [a, b] = range.split("-");
        base =
          b === undefined
            ? label(parseValue(a, spec))
            : `${label(parseValue(a, spec))} through ${label(parseValue(b, spec))}`;
      }
      return step ? `every ${step}${base ? ` starting at ${base}` : ""}` : base;
    }),
  );
}

const everyN = (field: string) => /^\*\/\d+$/.exec(field)?.[0].slice(2);

export function describeCron(schedule: CronSchedule) {
  const [minute, hour, dom, month, dow] = schedule.fields;
  const [minutes, hours] = schedule.values;
  let time: string;

  if (minute === "*" && hour === "*") time = "Every minute";
  else if (everyN(minute) && hour === "*") time = `Every ${everyN(minute)} minutes`;
  else if (minutes.length === 1 && hour === "*") time = `At minute ${minutes[0]} past every hour`;
  else if (minutes.length === 1 && everyN(hour)) time = `At minute ${minutes[0]} past every ${everyN(hour)} hours`;
  else if (minutes.length * hours.length <= 6 && hour !== "*") {
    time = `At ${list(hours.flatMap((h) => minutes.map((m) => `${pad(h)}:${pad(m)}`)))}`;
  } else {
    const m = minute === "*" ? "every minute" : `minute ${describeParts(minute, FIELDS[0], String)}`;
    const h = hour === "*" ? "every hour" : `hour ${describeParts(hour, FIELDS[1], String)}`;
    time = `At ${m} of ${h}`;
  }

  const dayParts: string[] = [];
  if (schedule.restrictedDom) {
    dayParts.push(everyN(dom) ? `every ${everyN(dom)} days` : `on day ${describeParts(dom, FIELDS[2], String)} of the month`);
  }
  if (schedule.restrictedDow) dayParts.push(`on ${describeParts(dow, FIELDS[4], (v) => DAYS[v % 7])}`);
  const days = dayParts.length ? ` ${dayParts.join(" or ")}` : "";
  const months =
    month === "*"
      ? ""
      : everyN(month)
        ? ` every ${everyN(month)} months`
        : ` in ${describeParts(month, FIELDS[3], (v) => MONTHS[v - 1])}`;

  return `${time}${days}${months}.`;
}

/** Upcoming run times, searching day by day for up to five years. */
export function nextRuns(schedule: CronSchedule, count: number, from = new Date(), utc = false) {
  const [minutes, hours, doms, months, dows] = schedule.values;
  const runs: Date[] = [];
  const day = new Date(from);
  if (utc) day.setUTCHours(0, 0, 0, 0);
  else day.setHours(0, 0, 0, 0);

  for (let i = 0; i < 366 * 5 && runs.length < count; i++) {
    const get = (local: () => number, universal: () => number) => (utc ? universal() : local());
    const month = get(() => day.getMonth(), () => day.getUTCMonth()) + 1;
    const date = get(() => day.getDate(), () => day.getUTCDate());
    const weekday = get(() => day.getDay(), () => day.getUTCDay());
    const domOk = doms.includes(date);
    const dowOk = dows.includes(weekday);
    const dayOk =
      schedule.restrictedDom && schedule.restrictedDow ? domOk || dowOk : domOk && dowOk;

    if (months.includes(month) && dayOk) {
      for (const h of hours) {
        for (const m of minutes) {
          const run = new Date(day);
          if (utc) run.setUTCHours(h, m, 0, 0);
          else run.setHours(h, m, 0, 0);
          if (run > from) runs.push(run);
          if (runs.length >= count) return runs;
        }
      }
    }
    if (utc) day.setUTCDate(day.getUTCDate() + 1);
    else day.setDate(day.getDate() + 1);
  }
  return runs;
}
