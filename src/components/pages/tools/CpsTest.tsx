"use client";
import { useEffect, useRef, useState } from "react";
import { MousePointerClick, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { OptionPicker } from "@/components/tools/fields";
import { Stat, StatGrid } from "@/components/tools/stats";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

const DURATIONS = ["1", "5", "10", "30", "60"] as const;
type Duration = (typeof DURATIONS)[number];
type Phase = "ready" | "running" | "done";

function rating(cps: number) {
  if (cps < 4) return "🐢 Turtle";
  if (cps < 6) return "🐇 Rabbit";
  if (cps < 8) return "🐎 Horse";
  if (cps < 10) return "🐆 Cheetah";
  if (cps < 13) return "⚡ Lightning";
  return "🤖 Are you a bot?";
}

export default function CpsTest() {
  const [duration, setDuration] = useState<Duration>("5");
  const [phase, setPhase] = useState<Phase>("ready");
  const [clicks, setClicks] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [best, setBest] = useLocalStorage<Record<string, number>>("parcoil-cps-best", {});
  const startedAt = useRef(0);
  const clickCount = useRef(0); // read by the timer without re-subscribing
  const seconds = Number(duration);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const t = (performance.now() - startedAt.current) / 1000;
      if (t >= seconds) {
        const finalCps = clickCount.current / seconds;
        setBest((b) => (finalCps > (b[duration] ?? 0) ? { ...b, [duration]: finalCps } : b));
        setElapsed(seconds);
        setPhase("done");
        // Briefly ignore clicks so a late click doesn't start a new round.
        setLocked(true);
        setTimeout(() => setLocked(false), 1000);
      } else setElapsed(t);
    }, 50);
    return () => clearInterval(id);
  }, [phase, seconds, duration, setBest]);

  const cps = elapsed > 0 ? clicks / elapsed : 0;

  const click = () => {
    if (locked) return;
    if (phase === "done") return;
    if (phase === "ready") {
      startedAt.current = performance.now();
      clickCount.current = 1;
      setPhase("running");
      setClicks(1);
      return;
    }
    clickCount.current++;
    setClicks(clickCount.current);
  };

  const reset = () => {
    setPhase("ready");
    setClicks(0);
    setElapsed(0);
  };

  return (
    <ToolCard className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OptionPicker
          value={duration}
          onChange={(d) => {
            setDuration(d);
            reset();
          }}
          options={DURATIONS.map((d) => ({ value: d, label: `${d} s`, disabled: phase === "running" }))}
        />
        {best[duration] && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-amber-500" /> Best: {best[duration].toFixed(2)} CPS
          </p>
        )}
      </div>

      <StatGrid className="md:grid-cols-3">
        <Stat label="Clicks" value={clicks} />
        <Stat label="Time left" value={`${Math.max(0, seconds - elapsed).toFixed(1)} s`} />
        <Stat label="Clicks per second" value={cps.toFixed(2)} />
      </StatGrid>

      <button
        type="button"
        onMouseDown={click}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          "flex h-72 w-full select-none flex-col items-center justify-center gap-3 rounded-xl border-2 text-xl font-semibold transition-colors active:scale-[0.995]",
          phase === "running" ? "border-primary bg-primary/15" : "border-dashed bg-muted/30 hover:bg-muted/50",
        )}
      >
        {phase === "ready" && (
          <>
            <MousePointerClick className="h-10 w-10 text-primary" />
            Click here to start
          </>
        )}
        {phase === "running" && <span className="text-6xl tabular-nums">{clicks}</span>}
        {phase === "done" && (
          <>
            <span className="text-5xl tabular-nums text-primary">{cps.toFixed(2)} CPS</span>
            <span>{rating(cps)}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {clicks} clicks in {seconds} second{seconds > 1 ? "s" : ""}
            </span>
          </>
        )}
      </button>

      {phase === "done" && (
        <Button onClick={reset} className="w-full" disabled={locked}>
          <RotateCcw /> Try again
        </Button>
      )}
    </ToolCard>
  );
}
