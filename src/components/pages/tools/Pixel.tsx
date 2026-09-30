"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize } from "lucide-react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { SwitchField } from "@/components/tools/fields";

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Red", value: "#ff0000" },
  { name: "Green", value: "#00ff00" },
  { name: "Blue", value: "#0000ff" },
  { name: "Cyan", value: "#00ffff" },
  { name: "Magenta", value: "#ff00ff" },
  { name: "Yellow", value: "#ffff00" },
  { name: "Gray", value: "#808080" },
];

export default function Pixel() {
  const [index, setIndex] = useState<number | null>(null);
  const [auto, setAuto] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const enteredFullscreen = useRef(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const running = index !== null;

  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + COLORS.length) % COLORS.length)),
    [],
  );

  const stop = useCallback(() => {
    setIndex(null);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const start = () => {
    setIndex(0);
    enteredFullscreen.current = false;
    document.documentElement
      .requestFullscreen?.()
      .then(() => (enteredFullscreen.current = true))
      .catch(() => {});
    posthog.capture("pixel_test_started");
  };

  const revealHint = useCallback(() => {
    setShowHint(true);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setShowHint(false), 2500);
  }, []);

  useEffect(() => {
    if (!running) return;
    revealHint();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
      else if (e.key === "ArrowRight" || e.key === " ") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key.toLowerCase() === "a") setAuto((a) => !a);
      else if (e.key.toLowerCase() === "f") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
        return;
      } else return;
      e.preventDefault();
    };
    // Leaving fullscreen with the browser's own controls ends the test.
    const onFullscreenChange = () => {
      if (document.fullscreenElement) enteredFullscreen.current = true;
      else if (enteredFullscreen.current) setIndex(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      clearTimeout(hintTimer.current);
    };
  }, [running, step, stop, revealHint]);

  useEffect(() => {
    if (!running || !auto) return;
    const id = setInterval(() => step(1), 2000);
    return () => clearInterval(id);
  }, [running, auto, step]);

  if (running) {
    const color = COLORS[index];
    return (
      <div
        className="fixed inset-0 z-[100] cursor-none select-none"
        style={{ backgroundColor: color.value }}
        onClick={() => step(1)}
        onContextMenu={(e) => {
          e.preventDefault();
          step(-1);
        }}
        onMouseMove={revealHint}
      >
        <div
          className={`absolute inset-x-0 bottom-6 flex justify-center transition-opacity duration-500 ${showHint ? "opacity-100" : "opacity-0"}`}
        >
          <p className="rounded-lg bg-black/60 px-4 py-2 text-sm text-white">
            {color.name} · Click / → next · Right-click / ← previous · A auto-cycle
            {auto ? " (on)" : ""} · F fullscreen · Esc exit
          </p>
        </div>
      </div>
    );
  }

  return (
    <ToolCard className="max-w-xl">
      <div className="flex flex-wrap justify-center gap-2">
        {COLORS.map((c) => (
          <span
            key={c.name}
            title={c.name}
            className="h-8 w-8 rounded-md border"
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
      <SwitchField
        label="Auto-cycle colors"
        description="Switch to the next color every 2 seconds."
        checked={auto}
        onChange={setAuto}
      />
      <Button onClick={start} size="lg" className="w-full">
        <Maximize /> Start Pixel Test
      </Button>
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Controls</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Left click, Space or → : next color</li>
          <li>Right click or ← : previous color</li>
          <li>A: toggle auto-cycle · F: toggle fullscreen · Esc: exit</li>
        </ul>
      </div>
    </ToolCard>
  );
}
