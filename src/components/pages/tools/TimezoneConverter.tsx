"use client";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";
import { useMounted } from "@/hooks/use-mounted";
import { pad } from "@/lib/time";

const DEFAULT_ZONES = ["UTC", "America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney"];

/** Minutes the zone is ahead of UTC at the given instant. */
function zoneOffset(instant: number, zone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(instant))
      .map((p) => [p.type, Number(p.value)]),
  );
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUtc - instant) / 60000);
}

/** Converts a wall-clock time in `zone` to a UTC instant, handling DST shifts. */
function zonedToInstant(local: string, zone: string) {
  const [date, time] = local.split("T");
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const first = guess - zoneOffset(guess, zone) * 60000;
  return guess - zoneOffset(first, zone) * 60000;
}

const formatOffset = (minutes: number) =>
  `UTC${minutes >= 0 ? "+" : "−"}${pad(Math.floor(Math.abs(minutes) / 60))}:${pad(Math.abs(minutes) % 60)}`;

const cityName = (zone: string) => zone.split("/").pop()!.replace(/_/g, " ");

export default function TimezoneConverter() {
  const mounted = useMounted();
  const [allZones, setAllZones] = useState<string[]>(DEFAULT_ZONES);
  const [localZone, setLocalZone] = useState("UTC");
  const [sourceZone, setSourceZone] = useState("UTC");
  const [sourceInput, setSourceInput] = useState("UTC");
  const [when, setWhen] = useState("2026-01-01T09:00");
  const [zones, setZones] = useState(DEFAULT_ZONES);
  const [adding, setAdding] = useState("");

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const supported = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
    // Browsers may omit "UTC" or list the visitor's zone under another alias.
    setAllZones([...new Set([...DEFAULT_ZONES, zone, ...supported])].sort());
    const now = new Date();
    setLocalZone(zone);
    setSourceZone(zone);
    setSourceInput(zone);
    setWhen(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
    setZones((z) => (z.includes(zone) ? z : [zone, ...z]));
  }, []);

  const instant = when ? zonedToInstant(when, sourceZone) : NaN;
  const sourceDay = when.slice(0, 10);

  const addZone = () => {
    if (allZones.includes(adding) && !zones.includes(adding)) setZones([...zones, adding]);
    setAdding("");
  };

  return (
    <ToolCard className="max-w-3xl">
      <datalist id="tz-list">
        {allZones.map((z) => (
          <option key={z} value={z} />
        ))}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date and time" htmlFor="tz-when">
          <Input id="tz-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </Field>
        <Field label="In time zone" htmlFor="tz-source" hint={sourceInput !== sourceZone ? "Pick a zone from the list" : undefined}>
          <Input
            id="tz-source"
            list="tz-list"
            value={sourceInput}
            onChange={(e) => {
              setSourceInput(e.target.value);
              if (allZones.includes(e.target.value)) setSourceZone(e.target.value);
            }}
          />
        </Field>
      </div>

      {mounted && Number.isFinite(instant) && (
        <ul className="divide-y rounded-lg border">
          {zones.map((zone) => {
            const date = new Date(instant);
            const time = date.toLocaleTimeString(undefined, { timeZone: zone, hour: "2-digit", minute: "2-digit" });
            const day = date.toLocaleDateString("en-CA", { timeZone: zone });
            const dayLabel = date.toLocaleDateString(undefined, { timeZone: zone, weekday: "short", month: "short", day: "numeric" });
            const shift = day > sourceDay ? "+1 day" : day < sourceDay ? "−1 day" : "";
            return (
              <li key={zone} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {cityName(zone)}
                    {zone === localZone && <span className="ml-2 text-xs text-primary">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {zone} · {formatOffset(zoneOffset(instant, zone))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xl font-semibold tabular-nums">{time}</p>
                  <p className="text-xs text-muted-foreground">
                    {dayLabel} {shift && <span className="text-orange-600 dark:text-orange-400">{shift}</span>}
                  </p>
                </div>
                <Button variant="ghost" size="icon" aria-label={`Remove ${zone}`} onClick={() => setZones(zones.filter((z) => z !== zone))}>
                  <X />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          list="tz-list"
          placeholder="Add a time zone, e.g. Europe/Paris"
          aria-label="Add a time zone"
          value={adding}
          onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addZone()}
        />
        <Button variant="outline" onClick={addZone} disabled={!allZones.includes(adding)}>
          <Plus /> Add
        </Button>
      </div>
    </ToolCard>
  );
}
