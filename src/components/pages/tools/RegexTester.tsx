"use client";
import { Fragment, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";
import { cn } from "@/lib/utils";

const FLAGS = [
  { flag: "g", label: "global" },
  { flag: "i", label: "ignore case" },
  { flag: "m", label: "multiline" },
  { flag: "s", label: "dotall" },
  { flag: "u", label: "unicode" },
] as const;

const PRESETS = [
  { name: "Email", pattern: String.raw`[\w.+-]+@[\w-]+\.[\w.-]+` },
  { name: "URL", pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*` },
  { name: "IPv4", pattern: String.raw`\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b` },
  { name: "Hex color", pattern: String.raw`#(?:[0-9a-fA-F]{3}){1,2}\b` },
  { name: "Date (YYYY-MM-DD)", pattern: String.raw`(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})` },
  { name: "Phone (US)", pattern: String.raw`\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}` },
];

const MAX_MATCHES = 1000;

export default function RegexTester() {
  const [pattern, setPattern] = useState(PRESETS[4].pattern);
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState(
    "Release dates: 2024-03-15, 2025-11-02 and 2026-09-29.\nContact hello@parcoil.com or visit https://parcoil.com",
  );
  const [replacement, setReplacement] = useState("$<day>/$<month>/$<year>");

  const result = useMemo(() => {
    if (!pattern) return null;
    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    } catch (e) {
      return { error: (e as Error).message };
    }
    const matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) && matches.length < MAX_MATCHES) {
      matches.push(match);
      if (match[0] === "") regex.lastIndex++; // avoid looping forever on empty matches
      if (!flags.includes("g")) break;
    }
    let replaced = "";
    try {
      replaced = text.replace(new RegExp(pattern, flags), replacement);
    } catch {
      replaced = text;
    }
    return { matches, replaced };
  }, [pattern, flags, text, replacement]);

  const toggleFlag = (flag: string) =>
    setFlags((f) => (f.includes(flag) ? f.replace(flag, "") : f + flag));

  // Split the text into plain and highlighted segments.
  const highlighted = useMemo(() => {
    if (!result || "error" in result) return [text];
    const parts: React.ReactNode[] = [];
    let last = 0;
    result.matches.forEach((m, i) => {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(
        <mark key={i} className={cn("rounded-sm px-0.5", i % 2 ? "bg-primary/40" : "bg-primary/25", "text-foreground")}>
          {m[0] || "∅"}
        </mark>,
      );
      last = m.index + m[0].length;
    });
    parts.push(text.slice(last));
    return parts;
  }, [result, text]);

  return (
    <ToolCard>
      <div className="space-y-2">
        <Field label="Regular expression" htmlFor="regex">
          <div className="flex items-center gap-2 rounded-md border px-3 font-mono focus-within:ring-1 focus-within:ring-ring">
            <span className="text-muted-foreground">/</span>
            <Input
              id="regex"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="border-0 px-0 shadow-none focus-visible:ring-0 font-mono"
              spellCheck={false}
            />
            <span className="text-muted-foreground">/{flags}</span>
          </div>
        </Field>
        <div className="flex flex-wrap gap-2">
          {FLAGS.map(({ flag, label }) => (
            <Button
              key={flag}
              size="sm"
              variant={flags.includes(flag) ? "default" : "outline"}
              aria-pressed={flags.includes(flag)}
              onClick={() => toggleFlag(flag)}
            >
              <span className="font-mono">{flag}</span> {label}
            </Button>
          ))}
        </div>
        {result && "error" in result && <p className="text-sm text-destructive">{result.error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground self-center">Presets:</span>
        {PRESETS.map((preset) => (
          <Button key={preset.name} size="sm" variant="secondary" onClick={() => setPattern(preset.pattern)}>
            {preset.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Test string" htmlFor="regex-text">
          <Textarea
            id="regex-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-48 font-mono"
            spellCheck={false}
          />
        </Field>
        <Field
          label={
            result && "matches" in result
              ? `${result.matches.length}${result.matches.length === MAX_MATCHES ? "+" : ""} match${result.matches.length === 1 ? "" : "es"}`
              : "Matches"
          }
        >
          <div className="min-h-48 whitespace-pre-wrap wrap-break-word rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm">
            {highlighted}
          </div>
        </Field>
      </div>

      {result && "matches" in result && result.matches.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Match details</h2>
          <div className="max-h-72 overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Match</th>
                  <th className="px-3 py-2">Index</th>
                  <th className="px-3 py-2">Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono">
                {result.matches.slice(0, 100).map((m, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1.5 break-all">{m[0]}</td>
                    <td className="px-3 py-1.5">{m.index}</td>
                    <td className="px-3 py-1.5 text-xs">
                      {m.groups
                        ? Object.entries(m.groups).map(([k, v]) => (
                            <Fragment key={k}>
                              <span className="text-muted-foreground">{k}:</span> {v ?? "—"}{" "}
                            </Fragment>
                          ))
                        : m.slice(1).map((g, j) => (
                            <Fragment key={j}>
                              <span className="text-muted-foreground">${j + 1}:</span> {g ?? "—"}{" "}
                            </Fragment>
                          ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Replace with" htmlFor="regex-replace" hint="Use $1, $2… or $<name> for groups.">
          <Input id="regex-replace" value={replacement} onChange={(e) => setReplacement(e.target.value)} className="font-mono" />
        </Field>
        <OutputField multiline mono label="Result" value={result && "replaced" in result ? result.replaced : ""} />
      </div>
    </ToolCard>
  );
}
