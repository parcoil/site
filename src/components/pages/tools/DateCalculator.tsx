"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import ToolCard from "@/components/tools/ToolCard";
import { Field, NumberField, OptionPicker, SwitchField } from "@/components/tools/fields";
import { Stat, StatGrid } from "@/components/tools/stats";
import { addMonths, calendarDiff, daysBetween, parseDateInput, toDateInput, weekdaysBetween } from "@/lib/time";

const longDate = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

function addBusinessDays(date: Date, days: number) {
  const result = new Date(date);
  const step = days < 0 ? -1 : 1;
  let left = Math.abs(days);
  while (left > 0) {
    result.setDate(result.getDate() + step);
    if (result.getDay() !== 0 && result.getDay() !== 6) left--;
  }
  return result;
}

function Difference() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [includeEnd, setIncludeEnd] = useState(false);

  useEffect(() => {
    const today = new Date();
    setStart(toDateInput(today));
    setEnd(toDateInput(new Date(today.getFullYear(), 11, 25)));
  }, []);

  const a = parseDateInput(start);
  const b = parseDateInput(end);
  if (!a || !b) return null;
  const [from, to] = a <= b ? [a, b] : [b, a];
  const extra = includeEnd ? 1 : 0;
  const days = daysBetween(from, to) + extra;
  const diff = calendarDiff(from, to);
  const businessDays = weekdaysBetween(from, to) + (includeEnd && to.getDay() % 6 !== 0 ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" htmlFor="diff-start">
          <Input id="diff-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="End date" htmlFor="diff-end">
          <Input id="diff-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>
      <SwitchField label="Include the end date" description="Count both the first and last day." checked={includeEnd} onChange={setIncludeEnd} />
      <p className="text-center text-3xl font-bold">
        {days.toLocaleString()} <span className="text-xl font-medium text-muted-foreground">{days === 1 ? "day" : "days"}</span>
      </p>
      <StatGrid>
        <Stat label="Years, months, days" value={`${diff.years}y ${diff.months}m ${diff.days + extra}d`} />
        <Stat label="Weeks" value={`${Math.floor(days / 7)}w ${days % 7}d`} />
        <Stat label="Business days" value={businessDays.toLocaleString()} />
        <Stat label="Hours" value={(days * 24).toLocaleString()} />
      </StatGrid>
    </div>
  );
}

function AddSubtract() {
  const [start, setStart] = useState("");
  const [sign, setSign] = useState<"add" | "subtract">("add");
  const [years, setYears] = useState("0");
  const [months, setMonths] = useState("0");
  const [weeks, setWeeks] = useState("0");
  const [days, setDays] = useState("30");
  const [business, setBusiness] = useState(false);

  useEffect(() => setStart(toDateInput(new Date())), []);

  const base = parseDateInput(start);
  if (!base) return null;
  const s = sign === "add" ? 1 : -1;
  let result = addMonths(base, s * ((Number(years) || 0) * 12 + (Number(months) || 0)));
  const dayCount = (Number(weeks) || 0) * 7 + (Number(days) || 0);
  if (business) result = addBusinessDays(result, s * dayCount);
  else result.setDate(result.getDate() + s * dayCount);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" htmlFor="add-start">
          <Input id="add-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="Operation">
          <OptionPicker
            value={sign}
            onChange={setSign}
            options={[
              { value: "add", label: "Add" },
              { value: "subtract", label: "Subtract" },
            ]}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <NumberField label="Years" value={years} onChange={setYears} min={0} />
        <NumberField label="Months" value={months} onChange={setMonths} min={0} />
        <NumberField label="Weeks" value={weeks} onChange={setWeeks} min={0} />
        <NumberField label="Days" value={days} onChange={setDays} min={0} />
      </div>
      <SwitchField label="Count business days only" description="Weeks and days skip Saturdays and Sundays." checked={business} onChange={setBusiness} />
      <div className="rounded-lg bg-primary/10 p-4 text-center">
        <p className="text-sm text-muted-foreground">Result</p>
        <p className="text-2xl font-bold">{longDate(result)}</p>
      </div>
    </div>
  );
}

export default function DateCalculator() {
  const [mode, setMode] = useState<"difference" | "add">("difference");
  return (
    <ToolCard className="max-w-3xl">
      <OptionPicker
        value={mode}
        onChange={setMode}
        options={[
          { value: "difference", label: "Days between dates" },
          { value: "add", label: "Add or subtract days" },
        ]}
      />
      {mode === "difference" ? <Difference /> : <AddSubtract />}
    </ToolCard>
  );
}
