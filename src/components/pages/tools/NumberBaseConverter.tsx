"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";
import { Detail, DetailGrid } from "@/components/tools/stats";

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Parses an integer of any size in the given base; null if invalid. */
function parseBigInt(input: string, radix: number): bigint | null {
  let text = input.trim().toLowerCase().replace(/[\s_,]/g, "");
  const negative = text.startsWith("-");
  if (negative) text = text.slice(1);
  text = text.replace(radix === 16 ? /^0x/ : radix === 2 ? /^0b/ : radix === 8 ? /^0o/ : /^$/, "");
  if (!text) return null;
  let value = BigInt(0);
  const base = BigInt(radix);
  for (const c of text) {
    const digit = DIGITS.indexOf(c);
    if (digit < 0 || digit >= radix) return null;
    value = value * base + BigInt(digit);
  }
  return negative ? -value : value;
}

const BASES = [
  { radix: 2, label: "Binary (base 2)" },
  { radix: 8, label: "Octal (base 8)" },
  { radix: 10, label: "Decimal (base 10)" },
  { radix: 16, label: "Hexadecimal (base 16)" },
];

export default function NumberBaseConverter() {
  const [source, setSource] = useState({ radix: 10, text: "255" });
  const [customRadix, setCustomRadix] = useState(36);
  const value = parseBigInt(source.text, source.radix);

  const display = (radix: number) =>
    radix === source.radix ? source.text : value === null ? "" : value.toString(radix);

  const field = (radix: number, label: string) => (
    <Field key={radix} label={label} htmlFor={`base-${radix}`}>
      <div className="flex gap-2">
        <Input
          id={`base-${radix}`}
          value={display(radix)}
          onChange={(e) => setSource({ radix, text: e.target.value })}
          className={`font-mono ${radix === source.radix && value === null && source.text ? "border-destructive" : ""}`}
          spellCheck={false}
        />
        <CopyButton value={display(radix)} />
      </div>
    </Field>
  );

  const bits = value === null ? 0 : (value < BigInt(0) ? -value : value).toString(2).length;

  return (
    <ToolCard className="max-w-3xl">
      <div className="space-y-4">
        {BASES.map(({ radix, label }) => field(radix, label))}
        <div className="grid grid-cols-[8rem_1fr] items-end gap-3">
          <Field label="Custom base" htmlFor="custom-radix">
            <Input
              id="custom-radix"
              type="number"
              min={2}
              max={36}
              value={customRadix}
              onChange={(e) => setCustomRadix(Math.min(36, Math.max(2, Number(e.target.value) || 2)))}
            />
          </Field>
          {field(customRadix, `Base ${customRadix}`)}
        </div>
      </div>

      {source.text && value === null && (
        <p className="text-sm text-destructive">
          That isn&apos;t a valid base-{source.radix} number.
        </p>
      )}

      {value !== null && (
        <DetailGrid>
          <Detail label="Bits needed" value={bits.toLocaleString()} />
          <Detail label="Bytes needed" value={Math.ceil(bits / 8).toLocaleString()} />
          <Detail label="Decimal digits" value={value.toString().replace("-", "").length.toLocaleString()} />
        </DetailGrid>
      )}
    </ToolCard>
  );
}
