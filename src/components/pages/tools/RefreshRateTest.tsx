"use client";
import { useEffect, useRef, useState } from "react";
import ToolCard from "@/components/tools/ToolCard";
import { Stat, StatGrid } from "@/components/tools/stats";

const COMMON_RATES = [30, 50, 60, 75, 90, 100, 120, 144, 165, 180, 240, 280, 360, 480, 500];
const WINDOW = 120;

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
};

export default function RefreshRateTest() {
  const [hz, setHz] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [jitter, setJitter] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intervals: number[] = [];
    let last = performance.now();
    let frame = 0;
    let frameCount = 0;
    let droppedTotal = 0;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const barColor = getComputedStyle(canvas).color; // text-primary

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      // Ignore huge gaps from background tabs.
      if (delta < 250) {
        intervals.push(delta);
        if (intervals.length > WINDOW) intervals.shift();
      }
      const typical = median(intervals);
      if (typical && delta > typical * 1.5 && delta < 250) droppedTotal++;

      // Move the test box at a constant speed so stutter is visible.
      const track = trackRef.current;
      const box = boxRef.current;
      if (track && box) {
        const distance = track.clientWidth - box.clientWidth;
        const x = ((now / 1000) * 400) % (distance * 2);
        box.style.transform = `translateX(${x > distance ? distance * 2 - x : x}px)`;
      }

      // Frame time graph: each bar is one frame; taller means slower.
      const width = Math.round(canvas.clientWidth * devicePixelRatio);
      const height = Math.round(canvas.clientHeight * devicePixelRatio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const barWidth = width / WINDOW;
      ctx.clearRect(0, 0, width, height);
      intervals.forEach((d, i) => {
        ctx.fillStyle = d > typical * 1.5 ? "#ef4444" : barColor;
        const h = Math.min(height, (d / (typical * 3 || 50)) * height);
        ctx.fillRect(i * barWidth, height - h, Math.max(1, barWidth - 1), h);
      });

      if (++frameCount % 15 === 0 && typical) {
        const measured = 1000 / typical;
        const nearest = COMMON_RATES.reduce((a, b) => (Math.abs(b - measured) < Math.abs(a - measured) ? b : a));
        setHz(Math.abs(nearest - measured) / measured < 0.04 ? nearest : Math.round(measured));
        setDropped(droppedTotal);
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        setJitter(Math.sqrt(intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <ToolCard className="max-w-3xl">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Your display is running at</p>
        <p className="text-7xl font-bold tabular-nums text-primary">
          {hz || "…"}
          <span className="ml-1 text-3xl text-muted-foreground">Hz</span>
        </p>
      </div>

      <StatGrid className="md:grid-cols-3">
        <Stat label="Frame time" value={hz ? `${(1000 / hz).toFixed(2)} ms` : "—"} />
        <Stat label="Jitter" value={`${jitter.toFixed(2)} ms`} />
        <Stat label="Dropped frames" value={dropped} />
      </StatGrid>

      <div className="space-y-2">
        <p className="text-sm font-medium">Frame times</p>
        <canvas ref={canvasRef} className="h-24 w-full rounded-lg border bg-muted/30 text-primary" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Motion smoothness</p>
        <div ref={trackRef} className="relative h-16 overflow-hidden rounded-lg border bg-muted/30">
          <div ref={boxRef} className="absolute left-0 top-2 h-12 w-12 rounded-md bg-primary will-change-transform" />
        </div>
      </div>
    </ToolCard>
  );
}
