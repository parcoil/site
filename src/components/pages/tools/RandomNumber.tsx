"use client";
import { useEffect, useState } from "react";
import { Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { Field, SwitchField } from "@/components/tools/fields";
import { randomBetween, shuffle } from "@/lib/random";

function generate(min: number, max: number, count: number, unique: boolean) {
  const size = max - min + 1;
  if (unique && count > size) {
    throw new Error(`There are only ${size.toLocaleString()} different numbers between ${min} and ${max}.`);
  }
  if (!unique) return Array.from({ length: count }, () => randomBetween(min, max));
  // Shuffle small ranges; rejection-sample large ones.
  if (size <= 100000) {
    return shuffle(Array.from({ length: size }, (_, i) => min + i)).slice(0, count);
  }
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randomBetween(min, max));
  return [...seen];
}

export default function RandomNumber() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [unique, setUnique] = useState(true);
  const [sorted, setSorted] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");

  const roll = () => {
    const lo = Math.ceil(Number(min));
    const hi = Math.floor(Number(max));
    const n = Math.min(10000, Math.max(1, Math.floor(Number(count)) || 1));
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo > hi) {
      setError("Enter a minimum that's less than or equal to the maximum.");
      return;
    }
    try {
      const numbers = generate(lo, hi, n, unique);
      setResults(sorted ? numbers.sort((a, b) => a - b) : numbers);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Show a number straight away, generated on the client only.
  useEffect(roll, []);

  return (
    <ToolCard className="max-w-2xl">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Min" htmlFor="rng-min">
          <Input id="rng-min" type="number" value={min} onChange={(e) => setMin(e.target.value)} />
        </Field>
        <Field label="Max" htmlFor="rng-max">
          <Input id="rng-max" type="number" value={max} onChange={(e) => setMax(e.target.value)} />
        </Field>
        <Field label="How many" htmlFor="rng-count">
          <Input id="rng-count" type="number" min={1} max={10000} value={count} onChange={(e) => setCount(e.target.value)} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <SwitchField label="No repeats" checked={unique} onChange={setUnique} />
        <SwitchField label="Sort results" checked={sorted} onChange={setSorted} />
      </div>

      <Button size="lg" className="w-full" onClick={roll}>
        <Dices /> Generate
      </Button>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : results.length === 1 ? (
        <p className="py-6 text-center text-7xl font-bold tabular-nums text-primary">{results[0]}</p>
      ) : (
        results.length > 0 && (
          <div className="space-y-3">
            <div className="flex max-h-80 flex-wrap gap-2 overflow-auto">
              {results.map((n, i) => (
                <span key={i} className="rounded-md border bg-muted/40 px-3 py-1 font-mono tabular-nums">
                  {n}
                </span>
              ))}
            </div>
            <CopyButton value={results.join(", ")} label="Copy all" />
          </div>
        )
      )}
    </ToolCard>
  );
}
