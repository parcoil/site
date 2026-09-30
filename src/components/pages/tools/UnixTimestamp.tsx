"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/tools/CopyButton";
import OutputField from "@/components/tools/OutputField";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";
import { useMounted } from "@/hooks/use-mounted";
import { pad, relativeTime } from "@/lib/time";

/** Values with 12+ digits are almost certainly milliseconds. */
function parseTimestamp(text: string): Date | null {
  const t = text.trim();
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  const date = new Date(Math.abs(n) >= 1e11 ? n : n * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

function LiveClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = String(Math.floor(now / 1000));
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-primary/10 p-6">
      <p className="text-sm text-muted-foreground">Current Unix timestamp</p>
      <div className="flex items-center gap-2">
        <span className="font-mono text-4xl font-bold tabular-nums text-primary sm:text-5xl">{seconds}</span>
        <CopyButton value={seconds} variant="ghost" />
      </div>
      <p className="font-mono text-sm text-muted-foreground">{now} ms</p>
    </div>
  );
}

export default function UnixTimestamp() {
  const mounted = useMounted();
  const [timestamp, setTimestamp] = useState("1700000000");
  const [local, setLocal] = useState("");

  useEffect(() => setLocal(toLocalInput(new Date())), []);

  const date = parseTimestamp(timestamp);
  const fromLocal = local ? new Date(local) : null;
  const validLocal = fromLocal && !Number.isNaN(fromLocal.getTime());

  return (
    <ToolCard className="max-w-3xl">
      {mounted && <LiveClock />}

      <section className="space-y-4">
        <h2 className="font-medium">Timestamp → date</h2>
        <Field label="Unix timestamp (seconds or milliseconds)" htmlFor="ts-input">
          <Input id="ts-input" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className="font-mono" inputMode="numeric" />
        </Field>
        {timestamp && !date && <p className="text-sm text-destructive">Enter a whole number of seconds or milliseconds.</p>}
        {mounted && date && (
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputField label="Your local time" value={date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" })} />
            <OutputField label="UTC" value={date.toUTCString()} />
            <OutputField mono label="ISO 8601" value={date.toISOString()} />
            <OutputField label="Relative" value={relativeTime(date)} />
          </div>
        )}
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="font-medium">Date → timestamp</h2>
        <Field label="Date and time (your time zone)" htmlFor="ts-local">
          <Input id="ts-local" type="datetime-local" step={1} value={local} onChange={(e) => setLocal(e.target.value)} />
        </Field>
        {validLocal && (
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputField mono label="Seconds" value={String(Math.floor(fromLocal.getTime() / 1000))} />
            <OutputField mono label="Milliseconds" value={String(fromLocal.getTime())} />
          </div>
        )}
      </section>
    </ToolCard>
  );
}
