"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";

const WHO = [
  { key: "u", label: "Owner" },
  { key: "g", label: "Group" },
  { key: "o", label: "Others" },
] as const;
const PERMS = [
  { bit: 4, label: "Read", char: "r" },
  { bit: 2, label: "Write", char: "w" },
  { bit: 1, label: "Execute", char: "x" },
] as const;
const SPECIAL = [
  { bit: 4, label: "Set UID" },
  { bit: 2, label: "Set GID" },
  { bit: 1, label: "Sticky" },
] as const;
const PRESETS = [
  { mode: "644", note: "Files" },
  { mode: "755", note: "Folders & scripts" },
  { mode: "600", note: "Private files" },
  { mode: "700", note: "Private folders" },
  { mode: "775", note: "Shared group" },
  { mode: "400", note: "Read-only keys" },
];

/** mode = [special, owner, group, others], each 0–7. */
type Mode = [number, number, number, number];

function symbolic([special, ...digits]: Mode) {
  return digits
    .map((d, i) => {
      const r = d & 4 ? "r" : "-";
      const w = d & 2 ? "w" : "-";
      let x = d & 1 ? "x" : "-";
      const flag = [4, 2, 1][i];
      if (special & flag) x = i === 2 ? (d & 1 ? "t" : "T") : d & 1 ? "s" : "S";
      return r + w + x;
    })
    .join("");
}

export default function ChmodCalculator() {
  const [mode, setMode] = useState<Mode>([0, 7, 5, 5]);
  const [text, setText] = useState("755");

  const setAll = (next: Mode) => {
    setMode(next);
    setText(`${next[0] ? next[0] : ""}${next.slice(1).join("")}`);
  };

  const toggle = (index: number, bit: number) => {
    const next = [...mode] as Mode;
    next[index] ^= bit;
    setAll(next);
  };

  const onText = (value: string) => {
    setText(value);
    if (/^[0-7]{3,4}$/.test(value)) {
      const digits = value.padStart(4, "0").split("").map(Number);
      setMode(digits as Mode);
    }
  };

  const numeric = `${mode[0] ? mode[0] : ""}${mode.slice(1).join("")}`;
  const symbolicClauses = WHO.map(
    ({ key }, i) => `${key}=${PERMS.filter((p) => mode[i + 1] & p.bit).map((p) => p.char).join("")}`,
  ).join(",");

  return (
    <ToolCard className="max-w-3xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium" />
              {PERMS.map((p) => (
                <th key={p.label} className="py-2 px-3 font-medium text-center">{p.label}</th>
              ))}
              <th className="py-2 px-3 font-medium text-center">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {WHO.map((who, i) => (
              <tr key={who.key}>
                <th className="py-3 pr-4 text-left font-medium">{who.label}</th>
                {PERMS.map((p) => (
                  <td key={p.label} className="py-3 px-3 text-center">
                    <input
                      type="checkbox"
                      aria-label={`${who.label} ${p.label}`}
                      checked={(mode[i + 1] & p.bit) !== 0}
                      onChange={() => toggle(i + 1, p.bit)}
                      className="h-5 w-5 cursor-pointer accent-primary"
                    />
                  </td>
                ))}
                <td className="py-3 px-3 text-center font-mono text-lg font-semibold text-primary">{mode[i + 1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {SPECIAL.map((s) => (
          <label key={s.label} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={(mode[0] & s.bit) !== 0}
              onChange={() => toggle(0, s.bit)}
              className="h-4 w-4 accent-primary"
            />
            {s.label}
          </label>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Numeric (octal)" htmlFor="chmod-number">
          <Input
            id="chmod-number"
            value={text}
            onChange={(e) => onText(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            className="font-mono text-lg"
          />
        </Field>
        <OutputField mono label="Symbolic" value={symbolic(mode)} inputClassName="text-lg" />
        <OutputField mono label="Command" value={`chmod ${numeric} file`} />
        <OutputField mono label="Symbolic command" value={`chmod ${symbolicClauses} file`} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Common permissions</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button key={p.mode} variant="outline" size="sm" onClick={() => onText(p.mode)}>
              <span className="font-mono">{p.mode}</span>
              <span className="text-muted-foreground">{p.note}</span>
            </Button>
          ))}
        </div>
      </div>
    </ToolCard>
  );
}
