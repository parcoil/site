"use client";
import { useEffect, useRef, useState } from "react";
import { Shuffle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { Field, OptionPicker, SwitchField } from "@/components/tools/fields";
import { randomItem, shuffle } from "@/lib/random";

const parseNames = (text: string) =>
  text
    .split(/\n|,/)
    .map((n) => n.trim())
    .filter(Boolean);

export default function RandomPicker() {
  const [text, setText] = useState("Alice\nBob\nCharlie\nDiana\nEthan\nFiona\nGeorge\nHannah");
  const [mode, setMode] = useState<"winners" | "teams">("winners");
  const [count, setCount] = useState("1");
  const [removeWinners, setRemoveWinners] = useState(false);
  const [rolling, setRolling] = useState<string | null>(null);
  const [winners, setWinners] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[][]>([]);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const names = parseNames(text);

  useEffect(() => () => clearInterval(timer.current), []);

  const pick = () => {
    if (names.length === 0) return;
    const n = Math.max(1, Math.floor(Number(count)) || 1);
    if (mode === "teams") {
      const size = Math.min(n, names.length);
      const groups: string[][] = Array.from({ length: size }, () => []);
      shuffle(names).forEach((name, i) => groups[i % size].push(name));
      setTeams(groups);
      return;
    }
    // Flash random names for a moment before revealing the result.
    const chosen = shuffle(names).slice(0, Math.min(n, names.length));
    setWinners([]);
    let ticks = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setRolling(randomItem(names));
      if (++ticks > 15) {
        clearInterval(timer.current);
        setRolling(null);
        setWinners(chosen);
        if (removeWinners) setText(names.filter((name) => !chosen.includes(name)).join("\n"));
      }
    }, 70);
  };

  return (
    <ToolCard>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label={`Names or options (${names.length})`} htmlFor="picker-names" hint="One per line, or separated by commas.">
          <Textarea id="picker-names" value={text} onChange={(e) => setText(e.target.value)} className="min-h-64" />
        </Field>

        <div className="space-y-5">
          <OptionPicker
            value={mode}
            onChange={setMode}
            options={[
              { value: "winners", label: <><Trophy /> Pick winners</> },
              { value: "teams", label: <><Shuffle /> Make teams</> },
            ]}
          />
          <Field label={mode === "teams" ? "Number of teams" : "Number of winners"} htmlFor="picker-count">
            <Input id="picker-count" type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} className="w-32" />
          </Field>
          {mode === "winners" && (
            <SwitchField
              label="Remove winners from the list"
              description="Handy for drawing prizes one at a time."
              checked={removeWinners}
              onChange={setRemoveWinners}
            />
          )}
          <Button size="lg" className="w-full" onClick={pick} disabled={names.length === 0 || rolling !== null}>
            {mode === "teams" ? "Shuffle into teams" : "Pick at random"}
          </Button>

          {mode === "winners" && (rolling || winners.length > 0) && (
            <div className="rounded-lg bg-primary/10 p-6 text-center">
              {rolling ? (
                <p className="text-3xl font-bold text-muted-foreground">{rolling}</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{winners.length > 1 ? "Winners" : "Winner"}</p>
                  {winners.map((w) => (
                    <p key={w} className="text-3xl font-bold text-primary">
                      {w}
                    </p>
                  ))}
                </>
              )}
            </div>
          )}

          {mode === "teams" && teams.length > 0 && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {teams.map((team, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="mb-1 text-sm font-semibold text-primary">Team {i + 1}</p>
                    <ul className="text-sm">
                      {team.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <CopyButton
                label="Copy teams"
                value={teams.map((t, i) => `Team ${i + 1}: ${t.join(", ")}`).join("\n")}
              />
            </div>
          )}
        </div>
      </div>
    </ToolCard>
  );
}
