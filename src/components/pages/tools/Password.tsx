"use client";
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Shield } from "lucide-react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { SliderField, SwitchField } from "@/components/tools/fields";
import { randomInt } from "@/lib/random";
import { cn } from "@/lib/utils";

const SETS = {
  lowercase: { label: "Lowercase Letters (a-z)", chars: "abcdefghijklmnopqrstuvwxyz" },
  uppercase: { label: "Uppercase Letters (A-Z)", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  numbers: { label: "Numbers (0-9)", chars: "0123456789" },
  symbols: { label: "Symbols (!@#$%^&*)", chars: "!@#$%^&*()_-+=<>?[]{}~" },
} as const;
type SetId = keyof typeof SETS;

const AMBIGUOUS = /[Il1O0o|]/g;

function generate(length: number, sets: string[]) {
  const pool = sets.join("");
  // Retry until every chosen set is represented; unbiased and fast in practice.
  for (;;) {
    const password = Array.from({ length }, () => pool[randomInt(pool.length)]).join("");
    if (length < sets.length || sets.every((set) => [...set].some((c) => password.includes(c)))) {
      return password;
    }
  }
}

function strength(bits: number) {
  if (bits < 40) return { label: "Weak", className: "text-red-500", width: "25%" };
  if (bits < 60) return { label: "Fair", className: "text-orange-500", width: "50%" };
  if (bits < 90) return { label: "Strong", className: "text-green-500", width: "75%" };
  return { label: "Very strong", className: "text-emerald-500", width: "100%" };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [enabled, setEnabled] = useState<Record<SetId, boolean>>({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  });
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");

  const sets = (Object.keys(SETS) as SetId[])
    .filter((id) => enabled[id])
    .map((id) => (excludeAmbiguous ? SETS[id].chars.replace(AMBIGUOUS, "") : SETS[id].chars));
  const poolSize = sets.join("").length;
  const bits = Math.round(length * Math.log2(Math.max(poolSize, 1)));
  const rating = strength(bits);
  const setsKey = sets.join("|");

  const regenerate = useCallback(() => {
    if (!setsKey) return;
    const chosen = setsKey.split("|");
    setPassword(generate(length, chosen));
    posthog.capture("password_generated", { length, character_sets: chosen.length });
  }, [length, setsKey]);

  useEffect(regenerate, [regenerate]);

  const toggle = (id: SetId) => (checked: boolean) => {
    // Always keep at least one character set on.
    if (!checked && Object.values(enabled).filter(Boolean).length === 1) return;
    setEnabled((e) => ({ ...e, [id]: checked }));
  };

  return (
    <ToolCard className="max-w-lg">
      <div className="space-y-3 rounded-lg bg-muted/40 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4" /> Your Password
          </span>
          <span className={cn("text-sm font-medium", rating.className)}>
            {rating.label} · {bits} bits
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            readOnly
            value={password}
            onFocus={(e) => e.target.select()}
            className="font-mono text-center text-base"
            aria-label="Generated password"
          />
          <Button variant="outline" size="icon" onClick={regenerate} aria-label="Generate new password">
            <RefreshCw />
          </Button>
          <CopyButton
            value={password}
            message="Password copied to clipboard!"
            onClickCapture={() => posthog.capture("password_copied", { length })}
          />
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full bg-current transition-all", rating.className)} style={{ width: rating.width }} />
        </div>
      </div>

      <SliderField
        label="Password Length"
        value={length}
        onChange={setLength}
        min={4}
        max={64}
        format={(v) => `${v} characters`}
      />

      <div className="space-y-4">
        {(Object.keys(SETS) as SetId[]).map((id) => (
          <SwitchField key={id} label={`Include ${SETS[id].label}`} checked={enabled[id]} onChange={toggle(id)} />
        ))}
        <SwitchField
          label="Exclude ambiguous characters"
          description="Skip look-alikes such as I, l, 1, O and 0."
          checked={excludeAmbiguous}
          onChange={setExcludeAmbiguous}
        />
      </div>

      <div className="text-sm text-muted-foreground space-y-2">
        <h2 className="font-medium">Password Tips:</h2>
        <ul className="list-disc pl-5 text-xs space-y-1">
          <li>Use a different password for each account</li>
          <li>Longer passwords (16+ characters) provide better security</li>
          <li>Store your passwords in a password manager</li>
        </ul>
      </div>
    </ToolCard>
  );
}
