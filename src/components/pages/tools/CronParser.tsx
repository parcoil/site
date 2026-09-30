"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ToolCard from "@/components/tools/ToolCard";
import { Field, SwitchField } from "@/components/tools/fields";
import { useMounted } from "@/hooks/use-mounted";
import { describeCron, nextRuns, parseCron } from "@/lib/cron";
import { relativeTime } from "@/lib/time";

const PRESETS = [
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Hourly", value: "0 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Weekdays at 9am", value: "0 9 * * 1-5" },
  { label: "Sundays at 3am", value: "0 3 * * 0" },
  { label: "First of the month", value: "0 0 1 * *" },
];

const FIELD_NAMES = ["Minute", "Hour", "Day of month", "Month", "Day of week"];
const FIELD_HINTS = ["0–59", "0–23", "1–31", "1–12 or JAN–DEC", "0–6 or SUN–SAT"];

export default function CronParser() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [utc, setUtc] = useState(false);
  const mounted = useMounted();

  const result = useMemo(() => {
    try {
      const schedule = parseCron(expression);
      return { schedule, description: describeCron(schedule) };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [expression]);

  const runs = mounted && "schedule" in result ? nextRuns(result.schedule, 8, new Date(), utc) : [];

  return (
    <ToolCard className="max-w-3xl">
      <Field label="Cron expression" htmlFor="cron">
        <Input
          id="cron"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="h-12 text-center font-mono text-xl"
          spellCheck={false}
        />
      </Field>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.value} size="sm" variant="secondary" onClick={() => setExpression(p.value)}>
            {p.label}
          </Button>
        ))}
      </div>

      {"error" in result ? (
        <p className="text-destructive">{result.error}</p>
      ) : (
        <>
          <p className="rounded-lg bg-primary/10 p-4 text-center text-lg font-medium">
            {result.description}
          </p>

          <div className="grid grid-cols-5 gap-2 text-center">
            {result.schedule.fields.map((field, i) => (
              <div key={i} className="rounded-lg border p-2">
                <p className="font-mono text-lg font-semibold text-primary">{field}</p>
                <p className="text-xs font-medium">{FIELD_NAMES[i]}</p>
                <p className="text-[11px] text-muted-foreground">{FIELD_HINTS[i]}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">Next runs</h2>
              <SwitchField label="Show in UTC" checked={utc} onChange={setUtc} />
            </div>
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {mounted ? "This schedule never runs in the next five years." : "Calculating…"}
              </p>
            ) : (
              <ol className="divide-y rounded-lg border text-sm">
                {runs.map((run) => (
                  <li key={run.getTime()} className="flex justify-between gap-4 px-3 py-2">
                    <span className="font-mono">
                      {run.toLocaleString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: utc ? "UTC" : undefined,
                      })}
                    </span>
                    <span className="text-muted-foreground">{relativeTime(run)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </ToolCard>
  );
}
