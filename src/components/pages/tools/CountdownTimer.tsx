"use client";
import { useEffect, useRef, useState } from "react";
import { BellOff, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tools/ToolCard";
import { NumberField } from "@/components/tools/fields";
import { formatClock } from "@/lib/time";

type Status = "idle" | "running" | "paused" | "done";
const PRESETS = [1, 3, 5, 10, 15, 25, 30, 60];

export default function CountdownTimer() {
  const [h, setH] = useState("0");
  const [m, setM] = useState("5");
  const [s, setS] = useState("0");
  const [status, setStatus] = useState<Status>("idle");
  const [remaining, setRemaining] = useState(5 * 60000);
  const [total, setTotal] = useState(5 * 60000);
  const endAt = useRef(0);
  const audio = useRef<AudioContext | null>(null);
  const alarm = useRef<ReturnType<typeof setInterval>>(undefined);
  const originalTitle = useRef("");

  const inputMs = ((Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0)) * 1000;

  const beep = () => {
    const ctx = audio.current;
    if (!ctx) return;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      const t = ctx.currentTime + i * 0.25;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  };

  const stopAlarm = () => {
    clearInterval(alarm.current);
    if (originalTitle.current) document.title = originalTitle.current;
  };

  useEffect(() => {
    originalTitle.current = document.title;
    return () => {
      stopAlarm();
      audio.current?.close();
    };
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      const left = Math.max(0, endAt.current - Date.now());
      setRemaining(left);
      document.title = `${formatClock(left, false)} · Timer`;
      if (left === 0) {
        setStatus("done");
        document.title = "⏰ Time's up!";
        beep();
        alarm.current = setInterval(beep, 1500);
      }
    }, 100);
    return () => clearInterval(id);
  }, [status]);

  const start = (ms = status === "paused" ? remaining : inputMs) => {
    if (ms <= 0) return;
    stopAlarm();
    // Creating the audio context during the click lets the alarm play later.
    audio.current ??= new AudioContext();
    if (status !== "paused") setTotal(ms);
    endAt.current = Date.now() + ms;
    setRemaining(ms);
    setStatus("running");
  };

  const reset = () => {
    stopAlarm();
    setStatus("idle");
    setRemaining(inputMs);
    setTotal(inputMs);
  };

  const preset = (minutes: number) => {
    setH(String(Math.floor(minutes / 60)));
    setM(String(minutes % 60));
    setS("0");
    start(minutes * 60000);
  };

  const shown = status === "idle" ? inputMs : remaining;
  const progress = total > 0 && status !== "idle" ? 1 - remaining / total : 0;

  return (
    <ToolCard className="max-w-xl">
      {status === "idle" ? (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="Hours" value={h} onChange={setH} min={0} />
          <NumberField label="Minutes" value={m} onChange={setM} min={0} />
          <NumberField label="Seconds" value={s} onChange={setS} min={0} />
        </div>
      ) : null}

      <div className="space-y-3">
        <p className={`text-center font-mono text-6xl font-bold tabular-nums sm:text-7xl ${status === "done" ? "animate-pulse text-primary" : ""}`}>
          {status === "done" ? "Time's up!" : formatClock(shown, false)}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {status === "done" ? (
          <Button size="lg" className="col-span-2" onClick={reset}>
            <BellOff /> Stop alarm
          </Button>
        ) : (
          <>
            <Button size="lg" variant="outline" onClick={reset} disabled={status === "idle"}>
              <RotateCcw /> Reset
            </Button>
            {status === "running" ? (
              <Button size="lg" onClick={() => setStatus("paused")}>
                <Pause /> Pause
              </Button>
            ) : (
              <Button size="lg" onClick={() => start()} disabled={status === "idle" && inputMs === 0}>
                <Play /> {status === "paused" ? "Resume" : "Start"}
              </Button>
            )}
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((minutes) => (
          <Button key={minutes} variant="secondary" size="sm" onClick={() => preset(minutes)}>
            {minutes >= 60 ? `${minutes / 60} hour` : `${minutes} min`}
          </Button>
        ))}
      </div>
    </ToolCard>
  );
}
