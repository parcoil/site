"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { Stat, StatGrid } from "@/components/tools/stats";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { randomBetween } from "@/lib/random";
import { cn } from "@/lib/utils";

type Phase = "idle" | "waiting" | "go" | "early" | "result";
const ATTEMPTS = 5;

export default function ReactionTime() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [best, setBest] = useLocalStorage<number>("parcoil-reaction-best", 0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shownAt = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const done = times.length >= ATTEMPTS;
  const average = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  const press = () => {
    if (phase === "waiting") {
      clearTimeout(timer.current);
      setPhase("early");
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - shownAt.current);
      const next = [...times, ms];
      setTimes(next);
      setPhase("result");
      if (next.length === ATTEMPTS) {
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        if (!best || avg < best) setBest(avg);
      }
      return;
    }
    if (done) return;
    setPhase("waiting");
    timer.current = setTimeout(() => {
      shownAt.current = performance.now();
      setPhase("go");
    }, randomBetween(1500, 4500));
  };

  const reset = () => {
    clearTimeout(timer.current);
    setTimes([]);
    setPhase("idle");
  };

  const last = times[times.length - 1];

  return (
    <ToolCard className="max-w-3xl">
      <button
        type="button"
        onPointerDown={press}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            press();
          }
        }}
        className={cn(
          "flex h-80 w-full select-none flex-col items-center justify-center gap-3 rounded-xl text-white transition-colors duration-75 touch-none",
          phase === "waiting" && "bg-red-600",
          phase === "go" && "bg-green-500",
          phase === "early" && "bg-amber-500",
          (phase === "idle" || phase === "result") && "bg-primary text-primary-foreground",
        )}
      >
        {phase === "idle" && (
          <>
            <Zap className="h-12 w-12" />
            <span className="text-3xl font-bold">Click to start</span>
            <span className="opacity-90">When the red box turns green, click as fast as you can.</span>
          </>
        )}
        {phase === "waiting" && <span className="text-4xl font-bold">Wait for green…</span>}
        {phase === "go" && <span className="text-5xl font-bold">Click!</span>}
        {phase === "early" && (
          <>
            <span className="text-4xl font-bold">Too soon!</span>
            <span>Click to try again</span>
          </>
        )}
        {phase === "result" && (
          <>
            <span className="text-6xl font-bold tabular-nums">{last} ms</span>
            <span>{done ? `Average: ${average} ms` : `Click to keep going (${times.length}/${ATTEMPTS})`}</span>
          </>
        )}
      </button>

      <StatGrid>
        <Stat label="Attempts" value={`${times.length}/${ATTEMPTS}`} />
        <Stat label="Average" value={average ? `${average} ms` : "—"} />
        <Stat label="Fastest" value={times.length ? `${Math.min(...times)} ms` : "—"} />
        <Stat label="Best average" value={best ? `${best} ms` : "—"} />
      </StatGrid>

      {times.length > 0 && (
        <Button variant="outline" onClick={reset}>
          <RotateCcw /> {done ? "Start a new round" : "Reset"}
        </Button>
      )}
    </ToolCard>
  );
}
