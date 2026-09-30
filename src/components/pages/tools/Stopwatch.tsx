"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Flag, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { formatClock } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const startedAt = useRef(0); // performance.now() minus time already elapsed

  useEffect(() => {
    if (!running) return;
    let frame = requestAnimationFrame(function tick() {
      setElapsed(performance.now() - startedAt.current);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const toggle = useCallback(() => {
    setRunning((r) => {
      if (!r) startedAt.current = performance.now() - elapsed;
      return !r;
    });
  }, [elapsed]);

  const lap = useCallback(() => {
    if (running) setLaps((l) => [...l, elapsed]);
  }, [running, elapsed]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key.toLowerCase() === "l") lap();
      else if (e.key.toLowerCase() === "r") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, lap, reset]);

  const splits = laps.map((t, i) => t - (laps[i - 1] ?? 0));
  const fastest = splits.length > 1 ? Math.min(...splits) : -1;
  const slowest = splits.length > 1 ? Math.max(...splits) : -1;

  return (
    <ToolCard className="max-w-xl">
      <p className="py-6 text-center font-mono text-6xl font-bold tabular-nums sm:text-7xl">
        {formatClock(elapsed)}
      </p>

      <div className="grid grid-cols-3 gap-3">
        <Button size="lg" variant="outline" onClick={reset} disabled={elapsed === 0}>
          <RotateCcw /> Reset
        </Button>
        <Button size="lg" onClick={toggle}>
          {running ? <Pause /> : <Play />} {running ? "Pause" : elapsed ? "Resume" : "Start"}
        </Button>
        <Button size="lg" variant="outline" onClick={lap} disabled={!running}>
          <Flag /> Lap
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">Keyboard: Space start/pause · L lap · R reset</p>

      {laps.length > 0 && (
        <ol className="max-h-80 divide-y overflow-auto rounded-lg border font-mono text-sm tabular-nums">
          {laps
            .map((total, i) => ({ total, split: splits[i], n: i + 1 }))
            .reverse()
            .map(({ total, split, n }) => (
              <li
                key={n}
                className={cn(
                  "flex justify-between px-4 py-2",
                  split === fastest && "text-green-600 dark:text-green-400",
                  split === slowest && "text-red-600 dark:text-red-400",
                )}
              >
                <span>Lap {n}</span>
                <span>{formatClock(split)}</span>
                <span className="text-muted-foreground">{formatClock(total)}</span>
              </li>
            ))}
        </ol>
      )}
    </ToolCard>
  );
}
