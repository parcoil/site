"use client";
import { useState } from "react";
import { Coins, Dices, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SliderField } from "@/components/tools/fields";
import { randomBetween, randomInt } from "@/lib/random";
import { cn } from "@/lib/utils";

const SIDES = ["4", "6", "8", "10", "12", "20", "100"] as const;
const PIPS = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

type Roll = { sides: number; values: number[] };

function Dice() {
  const [sides, setSides] = useState<(typeof SIDES)[number]>("6");
  const [count, setCount] = useState(2);
  const [roll, setRoll] = useState<Roll | null>(null);
  const [history, setHistory] = useState<Roll[]>([]);
  const [spin, setSpin] = useState(0);

  const doRoll = () => {
    const next = { sides: Number(sides), values: Array.from({ length: count }, () => randomBetween(1, Number(sides))) };
    setRoll(next);
    setHistory((h) => [next, ...h].slice(0, 10));
    setSpin((s) => s + 1);
  };

  const total = roll?.values.reduce((a, b) => a + b, 0) ?? 0;

  return (
    <div className="space-y-5">
      <Field label="Dice">
        <OptionPicker value={sides} onChange={setSides} options={SIDES.map((s) => ({ value: s, label: `D${s}` }))} />
      </Field>
      <SliderField label="Number of dice" value={count} onChange={setCount} min={1} max={10} />
      <Button size="lg" className="w-full" onClick={doRoll}>
        <Dices /> Roll {count}D{sides}
      </Button>

      {roll && (
        <div key={spin} className="space-y-3 text-center animate-in zoom-in-90 fade-in duration-300">
          <div className="flex flex-wrap justify-center gap-3">
            {roll.values.map((v, i) =>
              roll.sides === 6 ? (
                <span key={i} className="text-7xl leading-none text-primary" aria-label={String(v)}>
                  {PIPS[v - 1]}
                </span>
              ) : (
                <span key={i} className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-primary text-2xl font-bold">
                  {v}
                </span>
              ),
            )}
          </div>
          {roll.values.length > 1 && <p className="text-xl">Total: <strong className="text-primary">{total}</strong></p>}
        </div>
      )}

      {history.length > 1 && (
        <div className="text-sm">
          <p className="mb-1 font-medium">Recent rolls</p>
          <ul className="space-y-0.5 text-muted-foreground">
            {history.slice(1).map((h, i) => (
              <li key={i}>
                {h.values.length}D{h.sides}: {h.values.join(" + ")}
                {h.values.length > 1 && ` = ${h.values.reduce((a, b) => a + b, 0)}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Coin() {
  const [side, setSide] = useState<"Heads" | "Tails" | null>(null);
  const [tally, setTally] = useState({ Heads: 0, Tails: 0 });
  const [flips, setFlips] = useState(0);

  const flip = () => {
    const result = randomInt(2) === 0 ? "Heads" : "Tails";
    setSide(result);
    setTally((t) => ({ ...t, [result]: t[result] + 1 }));
    setFlips((f) => f + 1);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        key={flips}
        className={cn(
          "flex h-40 w-40 items-center justify-center rounded-full border-4 text-2xl font-bold shadow-lg",
          "bg-linear-to-br from-amber-200 to-amber-400 text-amber-900 border-amber-500",
          flips > 0 && "animate-in spin-in-[720deg] zoom-in-75 duration-500",
        )}
      >
        {side ?? "?"}
      </div>
      <Button size="lg" onClick={flip} className="w-full">
        <Coins /> Flip a coin
      </Button>
      {flips > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <span>Heads: <strong>{tally.Heads}</strong></span>
          <span>Tails: <strong>{tally.Tails}</strong></span>
          <Button variant="ghost" size="sm" onClick={() => { setTally({ Heads: 0, Tails: 0 }); setSide(null); setFlips(0); }}>
            <RotateCcw /> Reset
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DiceRoller() {
  return (
    <ToolCard>
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <Dice />
        <Coin />
      </div>
    </ToolCard>
  );
}
