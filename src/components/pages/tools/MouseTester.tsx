"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { Stat, StatGrid } from "@/components/tools/stats";
import { cn } from "@/lib/utils";

const BUTTONS = ["Left", "Middle", "Right", "Back", "Forward"];
const CHATTER_MS = 80;

export default function MouseTester() {
  const area = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState<number[]>([]);
  const [clicks, setClicks] = useState([0, 0, 0, 0, 0]);
  const [doubleClicks, setDoubleClicks] = useState(0);
  const [chatter, setChatter] = useState(0);
  const [wheel, setWheel] = useState({ up: 0, down: 0 });
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pollingRate, setPollingRate] = useState(0);
  const lastDown = useRef<number[]>([]);
  const moves = useRef(0);

  // Wheel must be a non-passive native listener to stop the page scrolling.
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY === 0) return;
      const direction = e.deltaY < 0 ? "up" : "down";
      setWheel((w) => ({ ...w, [direction]: w[direction] + 1 }));
      setScrollDirection(direction);
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => setScrollDirection(null), 200);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Estimate the polling rate from pointer events (including coalesced ones) per second.
  useEffect(() => {
    const id = setInterval(() => {
      const rate = moves.current * 2;
      moves.current = 0;
      if (rate > 0) setPollingRate((r) => Math.max(r, rate));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const reset = () => {
    setClicks([0, 0, 0, 0, 0]);
    setDoubleClicks(0);
    setChatter(0);
    setWheel({ up: 0, down: 0 });
    setPollingRate(0);
  };

  return (
    <ToolCard>
      <div
        ref={area}
        className="relative flex h-80 select-none flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed bg-muted/30 touch-none"
        onPointerDown={(e) => {
          const now = performance.now();
          if (now - (lastDown.current[e.button] ?? -Infinity) < CHATTER_MS) setChatter((c) => c + 1);
          lastDown.current[e.button] = now;
          setHeld((h) => [...h, e.button]);
          setClicks((c) => c.map((n, i) => (i === e.button ? n + 1 : n)));
        }}
        onPointerUp={(e) => setHeld((h) => h.filter((b) => b !== e.button))}
        onPointerLeave={() => setHeld([])}
        onPointerMove={(e) => {
          moves.current += e.nativeEvent.getCoalescedEvents?.().length || 1;
        }}
        onDoubleClick={() => setDoubleClicks((d) => d + 1)}
        onContextMenu={(e) => e.preventDefault()}
        onAuxClick={(e) => e.preventDefault()}
        onMouseUp={(e) => e.button > 2 && e.preventDefault()}
      >
        <svg viewBox="0 0 120 190" className="h-56" aria-hidden>
          <rect x="4" y="4" width="112" height="182" rx="56" className="fill-background stroke-border" strokeWidth="3" />
          <path d="M60 4 A56 56 0 0 0 4 60 L4 80 L60 80 Z" className={cn("stroke-border transition-colors", held.includes(0) ? "fill-primary" : "fill-muted")} strokeWidth="2" />
          <path d="M60 4 A56 56 0 0 1 116 60 L116 80 L60 80 Z" className={cn("stroke-border transition-colors", held.includes(2) ? "fill-primary" : "fill-muted")} strokeWidth="2" />
          <rect x="52" y="22" width="16" height="36" rx="8" className={cn("stroke-border transition-colors", held.includes(1) || scrollDirection ? "fill-primary" : "fill-background")} strokeWidth="2" />
          <rect x="0" y="92" width="10" height="22" rx="3" className={cn("transition-colors", held.includes(4) ? "fill-primary" : "fill-muted-foreground/40")} />
          <rect x="0" y="118" width="10" height="22" rx="3" className={cn("transition-colors", held.includes(3) ? "fill-primary" : "fill-muted-foreground/40")} />
        </svg>
        <p className="text-sm text-muted-foreground">Click, scroll and move your mouse inside this box</p>
        {scrollDirection && (
          <span className="absolute right-4 top-4 text-primary">
            {scrollDirection === "up" ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
          </span>
        )}
      </div>

      <StatGrid className="md:grid-cols-5">
        {BUTTONS.map((name, i) => (
          <Stat key={name} label={`${name} clicks`} value={clicks[i]} className={cn(held.includes(i) && "border-primary")} />
        ))}
      </StatGrid>
      <StatGrid>
        <Stat label="Double clicks" value={doubleClicks} />
        <Stat
          label={`Accidental double clicks (<${CHATTER_MS}ms)`}
          value={<span className={cn(chatter > 0 && "text-destructive")}>{chatter}</span>}
          className={cn(chatter > 0 && "border-destructive")}
        />
        <Stat label="Scroll up / down" value={`${wheel.up} / ${wheel.down}`} />
        <Stat label="Polling rate (est.)" value={pollingRate ? `${pollingRate} Hz` : "Move mouse"} />
      </StatGrid>

      <Button variant="outline" size="sm" onClick={reset}>
        <RotateCcw /> Reset
      </Button>
    </ToolCard>
  );
}
