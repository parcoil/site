"use client";
import { useMemo, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/tools/CopyButton";
import ToolCard from "@/components/tools/ToolCard";
import { Field } from "@/components/tools/fields";
import { detect, recover, type RecoveryResult } from "@/lib/bios";

const EXAMPLES = [
  "1234567-595B",
  "73KR-3FP9-PVKH-K29R",
  "CNU1234ABC",
  "A7AF422F",
  "07088120410C0000",
  "i 70412809",
  "2010-02-03",
];

export default function BiosPasswordRecovery() {
  const [challenge, setChallenge] = useState("");
  const [results, setResults] = useState<RecoveryResult[] | null>(null);

  // Lightweight: which families merely *recognise* the current input.
  const detected = useMemo(() => (challenge.trim() ? detect(challenge) : []), [challenge]);

  const onChallengeChange = (value: string) => {
    setChallenge(value);
    setResults(null);
  };

  const onRecover = () => setResults(recover(challenge));

  return (
    <ToolCard className="max-w-3xl">
      <p className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          For recovering passwords on hardware you own or are authorised to service. Everything runs
          in your browser &mdash; the challenge and any passwords never leave your device.
        </span>
      </p>

      <Field
        label="BIOS challenge / hash"
        htmlFor="bios-challenge"
        hint="Paste the code the BIOS shows (often after several failed attempts), or the service tag / serial it prints."
      >
        <div className="flex gap-2">
          <Input
            id="bios-challenge"
            value={challenge}
            onChange={(e) => onChallengeChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && detected.length > 0 && onRecover()}
            placeholder="e.g. 73KR-3FP9-PVKH-K29R"
            className="font-mono"
            spellCheck={false}
            autoComplete="off"
          />
          <Button type="button" onClick={onRecover} disabled={detected.length === 0}>
            <KeyRound className="h-4 w-4" />
            Recover
          </Button>
        </div>
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Examples:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onChallengeChange(example)}
            className="rounded-md border px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {example}
          </button>
        ))}
      </div>

      {challenge.trim() && results === null && (
        <p className="text-sm text-muted-foreground">
          {detected.length > 0 ? (
            <>
              Matches {detected.length} algorithm{detected.length > 1 ? "s" : ""}:{" "}
              {detected.map((g) => g.label).join(", ")}. Press <strong>Recover</strong> to run them.
            </>
          ) : (
            "No supported BIOS family recognises this format. Check the characters and length."
          )}
        </p>
      )}

      {results !== null && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <p className="text-sm text-destructive">
              No candidate passwords could be generated for this challenge.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {results.length} compatible algorithm{results.length > 1 ? "s" : ""} produced
                candidates. Try them in order; any one that matches unlocks the machine.
              </p>
              {results.map((result) => (
                <div key={result.generator.id} className="space-y-2 rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-medium leading-none">{result.generator.label}</h3>
                      <p className="text-xs text-muted-foreground">{result.generator.description}</p>
                    </div>
                    <Badge variant="secondary">{result.generator.vendor}</Badge>
                  </div>
                  <ul className="space-y-2">
                    {result.passwords.map((password, i) => (
                      <li key={`${password}-${i}`} className="flex items-center gap-2">
                        <code className="flex-1 overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm">
                          {password}
                        </code>
                        <CopyButton value={password} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </ToolCard>
  );
}
