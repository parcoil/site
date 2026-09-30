"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/tools/CopyButton";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";

const NUMERALS: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];
const VALID = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

function toRoman(n: number) {
  let rest = n;
  return NUMERALS.reduce((out, [value, symbol]) => {
    while (rest >= value) {
      out += symbol;
      rest -= value;
    }
    return out;
  }, "");
}

function fromRoman(text: string) {
  const s = text.trim().toUpperCase();
  if (!s || !VALID.test(s)) return null;
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const value = NUMERALS.find(([, sym]) => sym === s[i])![0];
    const next = NUMERALS.find(([, sym]) => sym === s[i + 1])?.[0] ?? 0;
    total += value < next ? -value : value;
  }
  return total;
}

export default function RomanNumerals() {
  const [arabic, setArabic] = useState("2026");
  const [roman, setRoman] = useState("MMXXVI");
  const [date, setDate] = useState("07.04.1776");

  const onArabic = (value: string) => {
    setArabic(value);
    const n = Number(value);
    setRoman(Number.isInteger(n) && n >= 1 && n <= 3999 ? toRoman(n) : "");
  };
  const onRoman = (value: string) => {
    setRoman(value.toUpperCase());
    const n = fromRoman(value);
    setArabic(n === null ? "" : String(n));
  };

  const arabicInvalid = arabic !== "" && !(Number.isInteger(Number(arabic)) && Number(arabic) >= 1 && Number(arabic) <= 3999);
  const romanInvalid = roman !== "" && fromRoman(roman) === null;
  const dateRoman = date.replace(/\d+/g, (d) => (Number(d) >= 1 && Number(d) <= 3999 ? toRoman(Number(d)) : d));

  return (
    <ToolCard className="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Number" htmlFor="arabic" hint={arabicInvalid ? "Enter a whole number from 1 to 3,999." : undefined}>
          <div className="flex gap-2">
            <Input id="arabic" type="number" min={1} max={3999} value={arabic} onChange={(e) => onArabic(e.target.value)} className="h-12 text-xl" />
            <CopyButton value={arabic} className="h-12 w-12" />
          </div>
        </Field>
        <Field label="Roman numeral" htmlFor="roman" hint={romanInvalid ? "That isn't a valid Roman numeral." : undefined}>
          <div className="flex gap-2">
            <Input id="roman" value={roman} onChange={(e) => onRoman(e.target.value)} className="h-12 font-serif text-xl tracking-wider" />
            <CopyButton value={roman} className="h-12 w-12" />
          </div>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date (any format)" htmlFor="roman-date" hint="Great for tattoos, engravings and anniversaries.">
          <Input id="roman-date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <OutputField label="Date in Roman numerals" value={dateRoman} inputClassName="font-serif tracking-wider" />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center sm:grid-cols-7">
        {NUMERALS.filter(([, s]) => s.length === 1).reverse().map(([value, symbol]) => (
          <div key={symbol} className="rounded-lg border p-2">
            <p className="font-serif text-2xl font-semibold text-primary">{symbol}</p>
            <p className="text-sm text-muted-foreground">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </ToolCard>
  );
}
