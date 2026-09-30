"use client";
import { useEffect, useState } from "react";
import { Cake } from "lucide-react";
import { Input } from "@/components/ui/input";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";
import { Detail, DetailGrid, Stat, StatGrid } from "@/components/tools/stats";
import { calendarDiff, daysBetween, parseDateInput, toDateInput } from "@/lib/time";

// [month, day] each sign starts on.
const ZODIAC: [number, number, string][] = [
  [1, 20, "Aquarius ♒"], [2, 19, "Pisces ♓"], [3, 21, "Aries ♈"], [4, 20, "Taurus ♉"],
  [5, 21, "Gemini ♊"], [6, 21, "Cancer ♋"], [7, 23, "Leo ♌"], [8, 23, "Virgo ♍"],
  [9, 23, "Libra ♎"], [10, 23, "Scorpio ♏"], [11, 22, "Sagittarius ♐"], [12, 22, "Capricorn ♑"],
];
const CHINESE = ["Rat 🐀", "Ox 🐂", "Tiger 🐅", "Rabbit 🐇", "Dragon 🐉", "Snake 🐍", "Horse 🐎", "Goat 🐐", "Monkey 🐒", "Rooster 🐓", "Dog 🐕", "Pig 🐖"];

/** Before this month's start date, it's still the previous month's sign. */
function zodiac(date: Date) {
  const month = date.getMonth();
  const [, startDay, sign] = ZODIAC[month];
  return date.getDate() >= startDay ? sign : ZODIAC[(month + 11) % 12][2];
}

export default function AgeCalculator() {
  const [birth, setBirth] = useState("2000-01-01");
  const [asOf, setAsOf] = useState("");

  useEffect(() => setAsOf(toDateInput(new Date())), []);

  const born = parseDateInput(birth);
  const on = parseDateInput(asOf);
  const valid = born && on && born <= on;

  let content = null;
  if (valid) {
    const age = calendarDiff(born, on);
    const days = daysBetween(born, on);
    let next = new Date(on.getFullYear(), born.getMonth(), born.getDate());
    if (next < on) next = new Date(on.getFullYear() + 1, born.getMonth(), born.getDate());
    const untilBirthday = daysBetween(on, next);

    content = (
      <>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Age</p>
          <p className="text-4xl font-bold sm:text-5xl">
            {age.years} <span className="text-2xl font-medium text-muted-foreground">years</span> {age.months}{" "}
            <span className="text-2xl font-medium text-muted-foreground">months</span> {age.days}{" "}
            <span className="text-2xl font-medium text-muted-foreground">days</span>
          </p>
          {untilBirthday === 0 ? (
            <p className="mt-2 flex items-center justify-center gap-2 text-lg font-medium text-primary">
              <Cake className="h-5 w-5" /> Happy birthday!
            </p>
          ) : (
            <p className="mt-2 text-muted-foreground">
              Next birthday in <strong className="text-foreground">{untilBirthday} days</strong>, on a{" "}
              {next.toLocaleDateString(undefined, { weekday: "long" })}
            </p>
          )}
        </div>

        <StatGrid>
          <Stat label="Total months" value={(age.years * 12 + age.months).toLocaleString()} />
          <Stat label="Total weeks" value={Math.floor(days / 7).toLocaleString()} />
          <Stat label="Total days" value={days.toLocaleString()} />
          <Stat label="Total hours" value={(days * 24).toLocaleString()} />
        </StatGrid>

        <DetailGrid>
          <Detail label="Born on a" value={born.toLocaleDateString(undefined, { weekday: "long" })} />
          <Detail label="Star sign" value={zodiac(born)} />
          <Detail label="Chinese zodiac" value={CHINESE[(((born.getFullYear() - 4) % 12) + 12) % 12]} />
        </DetailGrid>
      </>
    );
  }

  return (
    <ToolCard className="max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of birth" htmlFor="age-birth">
          <Input id="age-birth" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
        </Field>
        <Field label="Age on" htmlFor="age-on" hint="Defaults to today">
          <Input id="age-on" type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </Field>
      </div>
      {born && on && born > on && <p className="text-sm text-destructive">The birth date must be before the other date.</p>}
      {content}
    </ToolCard>
  );
}
